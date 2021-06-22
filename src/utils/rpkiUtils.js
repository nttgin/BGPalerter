import rpki from "rpki-validator";
import fs from "fs";
import md5 from "md5";
import axiosEnrich from "./axiosEnrich";
import axios from "axios";

export default class RpkiUtils {
    constructor(env) {
        this.config = env.config;
        this.agent = env.agent;
        this.params = this.config.rpki || {};
        this.clientId = env.clientId || "";
        this.logger = env.logger;
        this.userAgent = `${this.clientId}/${env.version}`;

        const defaultMarkDataAsStaleAfterMinutes = 60;

        const providers = ["ntt", "ripe", "cloudflare", "rpkiclient", "external", "api"]; // First provider is the default one

        if (this.params.url || this.params.vrpProvider === "api") {
            this.params.vrpProvider = "api";
            this.params.preCacheROAs = true;
            if (!this.params.url) {
                this.params.vrpProvider = providers[0];
                this.params.url = null;
                this.logger.log({
                    level: 'error',
                    message: "No url provided for the vrps api. Using default vrpProvider."
                });
            }
        }

        if (this.params.vrpFile) {
            this.params.vrpProvider = "external";
            this.params.refreshVrpListMinutes = null;
            this.params.preCacheROAs = true;
        } else {
            if (!this.params.vrpProvider) {
                this.params.vrpProvider = providers[0];
            } else if (!providers.includes(this.params.vrpProvider)) {
                this.params.vrpProvider = providers[0];
                this.logger.log({
                    level: 'error',
                    message: "The specified vrpProvider is not valid. Using default vrpProvider."
                });
            }
            this.params.refreshVrpListMinutes = Math.max(this.params.refreshVrpListMinutes || 0, 5);
            this.params.preCacheROAs = this.params.preCacheROAs !== false;
        }

        if (this.params.markDataAsStaleAfterMinutes !== undefined) {
            if (this.params.markDataAsStaleAfterMinutes <= this.params.refreshVrpListMinutes) {
                this.logger.log({
                    level: 'error',
                    message: `The specified markDataAsStaleAfterMinutes cannot be <= of refreshVrpListMinutes (${defaultMarkDataAsStaleAfterMinutes} minutes will be used).`
                });
                this.params.markDataAsStaleAfterMinutes = defaultMarkDataAsStaleAfterMinutes;
            }
        }

        this.status = {
            data: true,
            stale: false,
            provider: this.params.vrpProvider
        };

        this._loadRpkiValidator();

        if (this.params.markDataAsStaleAfterMinutes > 0) {
            setInterval(this._markAsStale, this.params.markDataAsStaleAfterMinutes * 60 * 1000);
        }

        this.queue = [];
        setInterval(this._validateQueue, 500); // Periodically validate prefixes-origin pairs
    };

    _loadRpkiValidatorFromVrpProvider = () => {

        if (!this.rpki) {
            const rpkiValidatorOptions = {
                connector: this.params.vrpProvider,
                clientId: this.clientId,
                axios: axiosEnrich(axios, (!this.params.noProxy && this.agent) ? this.agent : null, this.userAgent)
            };

            if (this.params.url) {
                rpkiValidatorOptions.url = this.params.url;
            }
            this.rpki = new rpki(rpkiValidatorOptions);

            if (!!this.params.preCacheROAs) {
                this._preCache();
            }
        }
    };

    _watchVrpFile = (vrpFile) => {
        const reload = () => { // Watch the external file to refresh the list
            if (this.watchFileTimer) {
                clearTimeout(this.watchFileTimer);
            }
            this.watchFileTimer = setTimeout(() => {
                this.logger.log({
                    level: 'info',
                    message: "VRPs reloaded due to file change."
                });
                this._loadRpkiValidatorFromVrpFile(vrpFile);
            }, 3000);
        };

        fs.watchFile(vrpFile, reload);
    };

    _loadRpkiValidatorFromVrpFile = (vrpFile) => {

        if (fs.existsSync(vrpFile)) {
            try {
                let vrps = JSON.parse(fs.readFileSync(vrpFile, 'utf8'));

                if (vrps) {
                    if (vrps.roas && vrps.roas.length) {
                        vrps = vrps.roas;
                    }
                    if (vrps.length > 0) {

                        if (this.rpki) {
                            this.rpki.destroy();
                        }

                        this.rpki = new rpki({
                            connector: "external",
                            clientId: this.clientId
                        });

                        this.rpki.setVRPs(vrps);
                        this._preCache();

                    } else {
                        this.logger.log({
                            level: 'error',
                            message: "The provided VRPs file is empty. Using default vrpProvider."
                        });
                    }
                }

            } catch (error) {
                this.logger.log({
                    level: 'error',
                    message: "The provided VRPs file cannot be parsed. Using default vrpProvider."
                });
            }
        } else {
            this.logger.log({
                level: 'error',
                message: "The provided VRPs file cannot be found. Using default vrpProvider."
            });
        }

        return this._loadRpkiValidatorFromVrpProvider();
    };

    _loadRpkiValidator = () => {
        if (!!this.params.vrpFile) {
            const vrpFile = this.config.volume + this.params.vrpFile;
            this._loadRpkiValidatorFromVrpFile(vrpFile);
            this._watchVrpFile(vrpFile);
        } else {
            this._loadRpkiValidatorFromVrpProvider();
        }
    };

    _preCache = () => {
        if (!!this.params.preCacheROAs) {
            return this.rpki
                .preCache(this.params.refreshVrpListMinutes)
                .then(data => {
                    this.status.data = true;
                    this.status.stale = false;

                    return data;
                })
                .catch(() => {
                    if (!this._cannotDownloadErrorOnce) {
                        this.logger.log({
                            level: 'error',
                            message: "The VRP list cannot be downloaded. The RPKI monitoring should be working anyway with one of the on-line providers."
                        });
                    }
                    this._cannotDownloadErrorOnce = true;
                })
        } else {
            this.status.data = true;
            this.status.stale = false;
            return Promise.resolve();
        }
    };

    _validateQueue = () => {
        const batch = {};

        for (let { message, matchedRule, callback } of this.queue) {
            const key = message.originAS.getId() + "-" + message.prefix;
            batch[key] = batch[key] || [];
            batch[key].push({ message, matchedRule, callback });
        }
        this.queue = [];

        this.validateBatch(Object
            .values(batch)
            .map((elements) => {
                const { message } = elements[0];
                return {
                    prefix: message.prefix,
                    origin: message.originAS
                };
            }))
            .then(results => {
                for (let result of results) {
                    const key = result.origin.getId() + "-" + result.prefix;
                    for (let { message, matchedRule, callback } of batch[key]) {
                        callback(result, message, matchedRule);
                    }
                }
            })
            .catch(error => {
                this.logger.log({
                    level: 'error',
                    message: error
                });
            });
    };

    addToValidationQueue = (message, matchedRule, callback) => {
        this.queue.push({ message, matchedRule, callback });
    };

    validate = (prefix, origin) => {
        return this.validateBatch([{ prefix, origin }])
            .then(results => results[0]);
    };

    validateBatch = (batch) => {
        return this._preCache()
            .then(() => {
                return Promise.all(batch
                    .map(({ prefix, origin }) => {
                        const origins = [].concat.apply([], [origin.getValue()]);
                        return Promise
                            .all(origins.map(asn => this.rpki.validate(prefix, asn, true))) // Validate each origin
                            .then(results => {
                                if (results.length === 1) { // Only one result = only one origin, just return
                                    return { ...results[0], prefix, origin };
                                } else { // Multiple origin
                                    if (results.every(result => result && result.valid)) { // All valid
                                        return {
                                            valid: true,
                                            covering: [].concat.apply([], results.map(i => i.covering)),
                                            prefix,
                                            origin
                                        };
                                    } else if (results.some(result => result && !result.valid)) { // At least one not valid
                                        return {
                                            valid: false,
                                            covering: [].concat.apply([], results.map(i => i.covering)),
                                            prefix,
                                            origin
                                        };
                                    } else { // return not covered
                                        return {
                                            valid: null,
                                            covering: [].concat.apply([], results.map(i => i.covering)),
                                            prefix,
                                            origin
                                        };
                                    }
                                }
                            });
                    }))
                    .catch(error => {
                        this.logger.log({
                            level: 'error',
                            message: "RPKI validation failed due to:" + error
                        });
                    })
            });
    };

    getVrps = () => {
        return this.rpki.toArray();
    };

    getStatus = () => {
        return this.status;
    };

    _markAsStale = () => {
        if (!!this.params.preCacheROAs) {
            const digest = md5(JSON.stringify(this.getVrps()));
            if (this.oldDigest) {
                this.status.stale = this.oldDigest === digest;
            }

            this.oldDigest = digest;
        }
    };
}