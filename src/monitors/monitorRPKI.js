import Monitor from "./monitor";
import rpki from "rpki-validator";

export default class MonitorRPKI extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.input.onChange(() => {
            this.updateMonitoredResources();
        });

        this.thresholdMinPeers = (params && params.thresholdMinPeers != null) ? params.thresholdMinPeers : 0;
        this.validationQueue = [];

        const rpkiValidatorOptions = {
            connector: this.params.vrpProvider || "ntt"
        };

        if (!this.params.noProxy && env.agent) {
            rpkiValidatorOptions.httpsAgent = env.agent;
        }

        this.rpki = new rpki(rpkiValidatorOptions);

        if (this.params.preCacheROAs) {
            this.rpki.preCache(Math.max(this.params.refreshVrpListMinutes, 15))
                .then(() => {
                    console.log("Downloaded");
                })
                .catch(() => {
                    this.logger.log({
                        level: 'error',
                        message: "One of the VRPs lists cannot be downloaded. Anyway, the RPKI monitoring should be working."
                    });
                });
        } else {
            setInterval(this.validateBatch, 400);
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
            const covering = (extra.covering && extra.covering[0]) ? extra.covering[0] : false;
            const coveringString = (covering) ? `Valid ROA: origin AS${covering.origin} prefix ${covering.prefix} max length ${covering.maxLength}` : '';

            if (extra.valid === null && this.params.checkUncovered) {
                return `The route ${message.prefix} announced by ${message.originAS} is not covered by a ROA. Accepted with AS path: ${message.path}`;
            } else {
                return `The route ${message.prefix} announced by ${message.originAS} is not RPKI valid. Accepted with AS path: ${message.path}.  ${coveringString}`;
            }
        }


    };


    validate = ({ message, matchedRule} ) => {
        const prefix = message.prefix;
        const origin = message.originAS.getValue();

        this.rpki.validate(prefix, origin, true)
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
        const matchedASRule = this.getMonitoredAsMatch(messageOrigin);
        const matchedPrefixRule = this.getMoreSpecificMatch(prefix, false);

        if (matchedPrefixRule) {
            this.validationQueue.push({ message, matchedRule: matchedPrefixRule });
        } else if (matchedASRule) {
            this.validationQueue.push({ message, matchedRule: matchedASRule });
        }

        return Promise.resolve(true);
    };



}
