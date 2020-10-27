import Monitor from "./monitor";
import rpki from "rpki-validator";
import fs from "fs";

export default class MonitorRPKI extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);

        this.providers = [ "ntt", "ripe", "cloudflare", "external" ]; // First provider is the default one

        this.refreshVrpListMinutes = this.params.refreshVrpListMinutes || 15;
        this.preCacheROAs = this.params.preCacheROAs !== false;

        this.input.onChange(() => {
            this.updateMonitoredResources();
        });

        this.thresholdMinPeers = (params && params.thresholdMinPeers != null) ? params.thresholdMinPeers : 0;
        this.validationQueue = [];

        this.loadRpkiValidator(env);
    };

    loadRpkiValidator = (env) => {
        if (!!this.params.vrpFile) {
            const vrpFile = env.config.volume + this.params.vrpFile;
            this._loadRpkiValidatorFromVrpFile(env, vrpFile);
            this._watchVrpFile(env, vrpFile);
        } else {
            this._loadRpkiValidatorFromVrpProvider(env);
        }
    };

    _watchVrpFile = (env, vrpFile) => {
        const reload = () => { // Watch the external file to refresh the list
            if (this.watchFileTimer) {
                clearTimeout(this.watchFileTimer);
            }
            this.watchFileTimer = setTimeout(() => {
                this.logger.log({
                    level: 'info',
                    message: "VRPs reloaded due to file change."
                });
                this._loadRpkiValidatorFromVrpFile(env, vrpFile);
            }, 500);
        };

        fs.watchFile(vrpFile, reload);
    };

    _loadRpkiValidatorFromVrpProvider = (env) => {

        if (!this.rpki) {
            const rpkiValidatorOptions = {
                connector: this.providers[0],
                clientId: env.clientId
            };

            if (this.params.vrpProvider) { // Use vrp provider
                if (this.providers.includes(this.params.vrpProvider)) {
                    rpkiValidatorOptions.connector = this.params.vrpProvider;
                } else {
                    this.logger.log({
                        level: 'error',
                        message: "The specified vrpProvider is not valid. Using default vrpProvider."
                    });
                }
            }

            if (!this.params.noProxy && env.agent) {
                rpkiValidatorOptions.httpsAgent = env.agent;
            }

            this.rpki = new rpki(rpkiValidatorOptions);

            if (!!this.preCacheROAs) {
                this.rpki
                    .preCache(Math.max(this.refreshVrpListMinutes, 15))
                    .then(() => {
                        this.validationTimer = setInterval(this.validateBatch, 100); // If already cached, we can validate more often
                    })
                    .catch(() => {
                        this.logger.log({
                            level: 'error',
                            message: "One of the VRPs lists cannot be downloaded. The RPKI monitoring should be working anyway with one of the on-line providers."
                        });
                    });
            } else {
                this.validationTimer = setInterval(this.validateBatch, 400); // Don't overload on-line validation
            }
        }
    };

    _loadRpkiValidatorFromVrpFile = (env, vrpFile) => {

        if (!!this.params.vrpProvider && this.params.vrpProvider !== "external") {
            this.logger.log({
                level: 'error',
                message: "You cannot specify a vrpProvider different from 'external' if you want to use a vrps file. Using default vrpProvider."
            });
        } else {
            if (fs.existsSync(vrpFile)) {
                try {
                    const vrps = JSON.parse(fs.readFileSync(vrpFile));

                    if (vrps.length > 0) {

                        if (this.validationTimer) {
                            clearInterval(this.validationTimer); // Stop validation cycle
                        }

                        if (this.rpki) {
                            this.rpki.destroy();
                        }

                        this.rpki = new rpki({
                            connector: "external",
                            clientId: env.clientId
                        });

                        this.rpki.setVRPs(vrps);

                        this.rpki
                            .preCache()
                            .then(() => {
                                this.validationTimer = setInterval(this.validateBatch, 100); // If already cached, we can validate more often
                            })
                            .catch(() => {
                                this.logger.log({
                                    level: 'error',
                                    message: "It was not possible to load correctly the VRPs file. Possibly there is an error in the format. The RPKI monitoring should be working anyway with one of the on-line providers."
                                });
                            });

                    } else {
                        this.logger.log({
                            level: 'error',
                            message: "The provided VRPs file is empty. Using default vrpProvider."
                        });
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
        }

        return this._loadRpkiValidatorFromVrpProvider(env);
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredASns();
    };

    validateBatch = () => {
        this.validationQueue.forEach(this.validate);
        this.validationQueue = [];
    };

    filter = (message) => {
        return message.type === 'announcement' && message.originAS.numbers.length === 1;
    };

    squashAlerts = (alerts) => {

        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;

        if (peers >= this.thresholdMinPeers) {
            const firstAlert = alerts[0];
            const message = firstAlert.matchedMessage;
            const extra = firstAlert.extra;
            const covering = (extra.covering && extra.covering.length) ? extra.covering.map(i => `${i.prefix}|AS${i.asn}|maxLength:${i.maxLength}`).join(", ") : false;
            const coveringString = (covering) ? `Valid ROAs: ${covering}`: '';

            if (extra.valid === null && this.params.checkUncovered) {
                return `The route ${message.prefix} announced by ${message.originAS} is not covered by a ROA`;
            } else {
                return `The route ${message.prefix} announced by ${message.originAS} is not RPKI valid. ${coveringString}`;
            }
        }
    };

    validate = ({ message, matchedRule} ) => {
        const prefix = message.prefix;
        const origin = message.originAS.getValue();

        this.rpki
            .validate(prefix, origin.toString(), true)
            .then(result => {
                if (result) {
                    const key = "a" + [prefix, origin, result.valid]
                        .join("-")
                        .replace(/\./g, "_")
                        .replace(/\:/g, "_")
                        .replace(/\//g, "_");

                    if (result.valid === false) {
                        this.publishAlert(key,
                            prefix,
                            matchedRule,
                            message,
                            { covering: result.covering, valid: result.valid });
                    } else if (result.valid === null && this.params.checkUncovered) {
                        this.publishAlert(key,
                            prefix,
                            matchedRule,
                            message,
                            { covering: null, valid: null });
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


    monitor = (message) => {

        const messageOrigin = message.originAS;
        const prefix = message.prefix;
        const matchedPrefixRule = this.getMoreSpecificMatch(prefix, false);

        if (matchedPrefixRule) {
            this.validationQueue.push({ message, matchedRule: matchedPrefixRule });
        } else {
            const matchedASRule = this.getMonitoredAsMatch(messageOrigin);
            if (matchedASRule) {
                this.validationQueue.push({ message, matchedRule: matchedASRule });
            }
        }

        return Promise.resolve(true);
    };



}
