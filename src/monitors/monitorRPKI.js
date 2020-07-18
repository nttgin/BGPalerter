import Monitor from "./monitor";
import rpki from "rpki-validator";
import fs from "fs";

export default class MonitorRPKI extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);

        this.providers = [ "ntt", "ripe", "external"]; // First provider is the default one

        this.refreshVrpListMinutes = this.params.refreshVrpListMinutes || 15;
        this.preCacheROAs = this.params.preCacheROAs !== false;

        this.input.onChange(() => {
            this.updateMonitoredResources();
        });

        this.thresholdMinPeers = (params && params.thresholdMinPeers != null) ? params.thresholdMinPeers : 0;
        this.validationQueue = [];

        const rpkiValidatorOptions = {
            connector: this.providers[0],
            clientId: env.clientId
        };

        if (this.params.vrpProvider) {
            if (this.providers.includes(this.params.vrpProvider)) {
                rpkiValidatorOptions.connector = this.params.vrpProvider;
            } else {
                this.logger.log({
                    level: 'error',
                    message: "The specified vrpProvider is not valid. Using default vrpProvider."
                });
            }
        }

        if (this.params.vrpFile) {
            this._readExternalVrpsFile(env.config.volume + this.params.vrpFile, rpkiValidatorOptions);
        }

        if (!this.params.noProxy && env.agent) {
            rpkiValidatorOptions.httpsAgent = env.agent;
        }

        this.rpki = new rpki(rpkiValidatorOptions);

        if (!!this.preCacheROAs) {
            this.rpki.preCache(Math.max(this.refreshVrpListMinutes, 15))
                .then(() => {
                    setInterval(this.validateBatch, 100);
                })
                .catch(() => {
                    this.logger.log({
                        level: 'error',
                        message: "One of the VRPs lists cannot be downloaded. The RPKI monitoring should be able to work anyway."
                    });
                });
        } else {
            setInterval(this.validateBatch, 400);
        }
    };

    _readExternalVrpsFile = (file, rpkiValidatorOptions) => {
        if (!!this.params.vrpProvider && this.params.vrpProvider !== "external") {
            rpkiValidatorOptions.connector = this.providers[0];
            delete rpkiValidatorOptions.vrps;
            this.logger.log({
                level: 'error',
                message: "You cannot specify a vrpProvider different from 'external' if you want to use a vrps file. Using default vrpProvider."
            });
        } else {
            if (fs.existsSync(file)) {
                try {
                    const vrps = JSON.parse(fs.readFileSync(file));

                    if (vrps.length > 0) {
                        rpkiValidatorOptions.connector = "external";
                        rpkiValidatorOptions.vrps = vrps;
                    } else {
                        rpkiValidatorOptions.connector = this.providers[0];
                        delete rpkiValidatorOptions.vrps;
                        this.logger.log({
                            level: 'error',
                            message: "The provided VRPs file is empty. Using default vrpProvider."
                        });
                    }

                } catch (error) {
                    rpkiValidatorOptions.connector = this.providers[0];
                    delete rpkiValidatorOptions.vrps;
                    this.logger.log({
                        level: 'error',
                        message: "The provided VRPs file cannot be parsed. Using default vrpProvider."
                    });
                }
            } else {
                rpkiValidatorOptions.connector = this.providers[0];
                delete rpkiValidatorOptions.vrps;

                this.logger.log({
                    level: 'error',
                    message: "The provided VRPs file cannot be found. Using default vrpProvider."
                });
            }
        }
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
                return `The route ${message.prefix} announced by ${message.originAS} is not covered by a ROA. Accepted with AS path: ${message.path}`;
            } else {
                return `The route ${message.prefix} announced by ${message.originAS} is not RPKI valid. Accepted with AS path: ${message.path}. ${coveringString}`;
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
