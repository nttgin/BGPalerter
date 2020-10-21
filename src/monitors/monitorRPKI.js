import Monitor from "./monitor";
import rpki from "rpki-validator";
import fs from "fs";
import md5 from "md5";
import diff from "../utils/rpkiDiffingTool";

export default class MonitorRPKI extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);

        this.providers = [ "ntt", "ripe", "external"]; // First provider is the default one

        this.refreshVrpListMinutes = (!!this.params.vrpFile) ? 0 : Math.max(this.params.refreshVrpListMinutes || 0, 15);
        this.preCacheROAs = this.params.preCacheROAs !== false;
        this.cacheValidPrefixesSeconds = (this.params.cacheValidPrefixesSeconds || 3600 * 24 * 7) * 1000;

        this.input.onChange(() => {
            this.updateMonitoredResources();
        });

        this.thresholdMinPeers = (params && params.thresholdMinPeers != null) ? params.thresholdMinPeers : 1;
        this.validationQueue = [];

        this.seenRpkiValidAnnouncementsKey = "seen-rpki-valid-announcements";
        this.storage
            .get(this.seenRpkiValidAnnouncementsKey)
            .then(prefixes => {
                this.seenRpkiValidAnnouncements = (prefixes) ? prefixes : {};
            })
            .catch(error => {
                this.logger.log({
                    level: 'error',
                    message: error
                });
            });
        this.loadRpkiValidator(env);

        setInterval(this._diffVrps, this.refreshVrpListMinutes + 60000);
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
                    .preCache(this.refreshVrpListMinutes)
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
                    let vrps = JSON.parse(fs.readFileSync(vrpFile, 'utf8'));

                    if (vrps) {
                        if (vrps.roas && vrps.roas.length) {
                            vrps = vrps.roas;
                        }
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
                                .preCache(this.refreshVrpListMinutes)
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

    _diffVrps = () => {
        let roaDiff;
        const newVrps = [...this.rpki.getRadixTrie().v4.values(), ...this.rpki.getRadixTrie().v6.values()]; // Get all the vrps as retrieved from the rpki validator

        if (this._oldVrps) { // No diff if there were no vrps before
            roaDiff = [].concat.apply([], this.monitored
                .map(i => diff(this._oldVrps, newVrps, i.asn.getValue()))); // Get the diff for each monitored AS
        }

        if (newVrps.length) {
            this._oldVrps = newVrps;
        }

        if (roaDiff && roaDiff.length) { // Differences found
            const impactedASes = [...new Set(roaDiff.map(i => i.asn))];
            const matchedRules = impactedASes.map(asn => this.getMonitoredAsMatch(asn));

            for (let matchedRule of matchedRules) { // An alert for each AS involved (they may have different user group)
                const message = roaDiff.map(this._roaToString).join("");

                console.log(message);
                this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                    matchedRule.asn.getId(),
                    matchedRule,
                    message,
                    {});
            }
        }

    };

    _roaToString = (roa) => {
        return `${roa.prefix} ${roa.asn} ${roa.maxLength} ${roa.ta || ""}`;
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

            if (extra.roaDisappeared) {
                return `The route ${message.prefix} announced by ${message.originAS} is no longer covered by a ROA.`;
            } else if (extra.valid === null && this.params.checkUncovered) {
                return `The route ${message.prefix} announced by ${message.originAS} is not covered by a ROA`;
            } else if (extra.valid === false) {
                return `The route ${message.prefix} announced by ${message.originAS} is not RPKI valid. ${coveringString}`;
            }
        }
    };

    validate = ({ message, matchedRule} ) => {
        const prefix = message.prefix;
        const origin = message.originAS.getValue();

        this.rpki
            .preCache(this.refreshVrpListMinutes)
            .then(() => {
                return this.rpki
                    .validate(prefix, origin.toString(), true)
                    .then(result => {
                        if (result) {

                            const cacheKey = "a" + [prefix, origin]
                                .join("-")
                                .replace(/\./g, "_")
                                .replace(/\:/g, "_")
                                .replace(/\//g, "_");

                            const key = `${cacheKey}-${result.valid}`;

                            if (result.valid === null) {

                                const cache = this.seenRpkiValidAnnouncements[cacheKey];
                                if (cache && cache.rpkiValid  && cache.date + this.cacheValidPrefixesSeconds >= new Date().getTime()) { // valid cache
                                    this.publishAlert(key,
                                        prefix,
                                        matchedRule,
                                        message,
                                        { covering: null, valid: null, roaDisappeared: true });
                                } else if (this.params.checkUncovered) {
                                    this.publishAlert(key,
                                        prefix,
                                        matchedRule,
                                        message,
                                        { covering: null, valid: null });
                                }
                            } else if (result.valid === false) {
                                this.publishAlert(key,
                                    prefix,
                                    matchedRule,
                                    message,
                                    { covering: result.covering, valid: false });

                            } else if (result.valid) {

                                // Refresh dictionary
                                this.seenRpkiValidAnnouncements[cacheKey] = {
                                    date: new Date().getTime(),
                                    rpkiValid: true
                                };

                                if (this.seenRpkiValidAnnouncementsTimer) {
                                    clearTimeout(this.seenRpkiValidAnnouncementsTimer);
                                }

                                // Store dictionary
                                this.seenRpkiValidAnnouncementsTimer = setTimeout(() => {
                                    const now = new Date().getTime();

                                    // Delete old cache items
                                    for (let roa of Object.keys(this.seenRpkiValidAnnouncements)) {
                                        if (this.seenRpkiValidAnnouncements[roa].date + this.cacheValidPrefixesSeconds < now) {
                                            delete this.seenRpkiValidAnnouncements[roa];
                                        }
                                    }
                                    this.storage
                                        .set(this.seenRpkiValidAnnouncementsKey, this.seenRpkiValidAnnouncements)
                                        .catch(error => {
                                            this.logger.log({
                                                level: 'error',
                                                message: error
                                            });
                                        });
                                }, 1000);

                            }
                        }
                    })
                    .catch(error => {
                        this.logger.log({
                            level: 'error',
                            message: error
                        });
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
