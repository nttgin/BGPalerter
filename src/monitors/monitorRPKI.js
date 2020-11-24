import Monitor from "./monitor";
import diff from "../utils/rpkiDiffingTool";

export default class MonitorRPKI extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);

        // Warn about deprecated config parameters
        for (const configParamKey of Object.keys(params)) {
            const deprecated = ["preCacheROAs", "refreshVrpListMinutes", "vrpFile", "vrpProvider"];
            if (deprecated.includes(configParamKey)) {
                this.logger.log({
                    level: 'error',
                    message: `The parameters ${deprecated.join(",")} are deprecated in monitorRPKI. Please use see here: https://github.com/nttgin/BGPalerter/blob/master/docs/rpki.md`
                });
            }
        }

        this.rpki = env.rpki;
        this.cacheValidPrefixesSeconds = (this.params.cacheValidPrefixesSeconds || 3600 * 24 * 7) * 1000;
        this.input.onChange(() => {
            this.updateMonitoredResources();
        });

        this.thresholdMinPeers = (params && params.thresholdMinPeers != null) ? params.thresholdMinPeers : 1;
        this.seenRpkiValidAnnouncementsKey = "seen-rpki-valid-announcements";
        this.storage
            .get(this.seenRpkiValidAnnouncementsKey)
            .then(prefixes => {
                this.seenRpkiValidAnnouncements = (prefixes) ? prefixes : {};
            })
            .catch(error => {
                console.log(error);
                this.logger.log({
                    level: 'error',
                    message: error
                });
            });
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredASns();
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

    };

    monitor = (message) => {

        const messageOrigin = message.originAS;
        const prefix = message.prefix;
        const matchedPrefixRule = this.getMoreSpecificMatch(prefix, false);

        if (matchedPrefixRule) {
            this.validate({ message, matchedRule: matchedPrefixRule });
        } else {
            const matchedASRule = this.getMonitoredAsMatch(messageOrigin);
            if (matchedASRule) {
                this.validate({ message, matchedRule: matchedASRule });
            }
        }

        return Promise.resolve(true);
    };
}
