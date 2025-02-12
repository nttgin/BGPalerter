import Monitor from "./monitor";
import md5 from "md5";
import {diff, getRelevant} from "../utils/rpkiDiffingTool";
import {AS} from "../model";
import moment from "moment";
import ipUtils from "ip-sub";
import batchPromises from "batch-promises";

const getTaToleranceDict = (tolerance) => {
    if (typeof (tolerance) === "number") {
        return {
            ripe: tolerance,
            apnic: tolerance,
            arin: tolerance,
            lacnic: tolerance,
            afrinic: tolerance
        };
    }

    return tolerance;
};

export default class MonitorROAS extends Monitor {

    constructor(name, channel, params, env, input) {
        super(name, channel, params, env, input);
        this.logger = env.logger;
        this.rpki = env.rpki;

        // Enabled checks
        this.enableDiffAlerts = params.enableDiffAlerts ?? true;
        this.enableExpirationAlerts = params.enableExpirationAlerts ?? true;
        this.enableExpirationCheckTA = params.enableExpirationCheckTA ?? true;
        this.enableDeletedCheckTA = params.enableDeletedCheckTA ?? true;
        this.diffEverySeconds = Math.max(params.diffEverySeconds || 600, 200);
        this.checkExpirationVrpsEverySeconds = Math.max(this.diffEverySeconds, 300);
        this.checkTaEverySeconds = Math.max(params.checkTaEverySeconds || 15 * 60, this.diffEverySeconds);
        this.enableAdvancedRpkiStats = params.enableAdvancedRpkiStats ?? true;


        // Default parameters
        this.roaExpirationAlertHours = params.roaExpirationAlertHours || 2;
        this.checkOnlyASns = params.checkOnlyASns != null ? params.checkOnlyASns : true;

        this.toleranceExpiredRoasTA = getTaToleranceDict(params.toleranceExpiredRoasTA || 20);
        this.toleranceDeletedRoasTA = getTaToleranceDict(params.toleranceDeletedRoasTA || 20);
        this.timesDeletedTAs = {};
        this.seenTAs = {};
        this.monitored = {
            asns: [],
            prefixes: []
        };

        this._enablePeriodicCheck(this.enableDiffAlerts, this._diffVrps, this.diffEverySeconds);
        this._enablePeriodicCheck(this.enableExpirationAlerts, this._verifyExpiration, this.checkExpirationVrpsEverySeconds);

        this._enablePeriodicCheck(this.enableDeletedCheckTA, this._checkDeletedRoasTAs, this.checkTaEverySeconds); // Check for TA malfunctions for too many deleted roas
        this._enablePeriodicCheck(this.enableExpirationCheckTA, this._checkExpirationTAs, this.checkTaEverySeconds); // Check for TA malfunctions for too many expiring roas
    };

    _enablePeriodicCheck = (condition, checkFunction, seconds) => {
        if (condition) {
            if (!global.EXTERNAL_ROA_EXPIRATION_TEST) {
                setTimeout(() => this._skipIfStaleVrps(checkFunction), 30 * 1000); // Initial run
            }
            setInterval(() => this._skipIfStaleVrps(checkFunction), global.EXTERNAL_ROA_EXPIRATION_TEST || seconds * 1000); // Periodic run
        }
    };

    _skipIfStaleVrps = (callback) => {
        if (!this.rpki.getStatus().stale) {
            callback();
        }
    };

    _calculateSizes = (vrps) => {
        const times = {};

        for (let ta in this.seenTAs) {
            times[ta] = 0;
        }

        for (let vrp of vrps) {
            times[vrp.ta] = times[vrp.ta] || 0;
            times[vrp.ta]++;
            this.seenTAs[vrp.ta] = true;
        }

        return times;
    };

    _checkDeletedRoasTAs = () => {
        const vrps = this.rpki.getVRPs(); // Get all the vrps as retrieved from the rpki validator
        const sizes = this._calculateSizes(vrps);
        const metadata = this.rpki.getMetadata();

        this.logger.log({
            level: "info",
            message: "Performing TA deletion check"
        });

        for (let ta in sizes) {
            if (this.timesDeletedTAs[ta]) {
                const oldSize = this.timesDeletedTAs[ta];
                const newSize = sizes[ta];

                if (oldSize > newSize) {
                    const min = Math.min(newSize, oldSize);
                    const max = Math.max(newSize, oldSize);
                    const diff = max - min;
                    const percentage = 100 / max * diff;

                    if (percentage > this.toleranceDeletedRoasTA[ta]) {
                        const message = `Possible TA malfunction or incomplete VRP file: ${percentage.toFixed(2)}% of the ROAs disappeared from ${ta}`;

                        this.publishAlert(`disappeared-${ta}`,
                            ta,
                            {group: "default"},
                            message,
                            {
                                rpkiMetadata: metadata,
                                subType: "ta-malfunction",
                                vrpCountBefore: oldSize,
                                vrpCountAfter: newSize,
                                disappearedPercentage: percentage,
                                ta
                            });
                    }
                }
            }
        }
        this.timesDeletedTAs = sizes;
    };

    _checkExpirationTAs = () => {

        const roaExpirationAlertHours = this.roaExpirationAlertHours;
        const vrps = this.rpki.getVRPs();
        const expiringVrps = vrps
            .filter(i => !!i.expires && (i.expires - moment.utc().unix() < roaExpirationAlertHours * 3600));

        const sizes = this._calculateSizes(vrps);
        const expiringSizes = this._calculateSizes(expiringVrps);

        this.logger.log({
            level: "info",
            message: "Performing TA expiration check"
        });

        for (let ta in sizes) {
            const min = expiringSizes[ta];
            const max = sizes[ta];
            const percentage = (100 / max) * min;

            if (percentage > this.toleranceExpiredRoasTA[ta]) {
                const currentTaVrps = vrps.filter(i => i.ta === ta);
                this._getExpiringItems(currentTaVrps)
                    .then(extra => {
                        const metadata = this.rpki.getMetadata();
                        const message = `Possible TA malfunction or incomplete VRP file: ${percentage.toFixed(2)}% of the ROAs are expiring in ${ta}`;

                        this.publishAlert(`expiring-${ta}`,
                            ta,
                            {group: "default"},
                            message,
                            {
                                ...extra,
                                subType: "ta-expire",
                                rpkiMetadata: metadata,
                                expiredPercentage: percentage,
                                ta,
                                vrpCount: sizes[ta],
                                expiringVrps: expiringSizes[ta]
                            });
                    })
                    .catch(error => {

                        this.logger.log({
                            level: "error",
                            message: error
                        });
                    });
            }
        }
    };

    _verifyExpiration = () => {
        const roaExpirationAlertHours = this.roaExpirationAlertHours;
        const roas = this.rpki.getVRPs();
        const metadata = this.rpki.getMetadata();
        const expiringRoas = roas
            .filter(i => !!i.expires && (i.expires - moment.utc().unix() < roaExpirationAlertHours * 3600));

        if (this.enableExpirationAlerts) {

            this.logger.log({
                level: "info",
                message: "Performing expiration check on VRPs"
            });

            const prefixesIn = this.monitored.prefixes.map(i => i.prefix);
            const asnsIn = this.monitored.asns.map(i => i.asn.getValue());
            const relevantVrps = getRelevant(expiringRoas, prefixesIn, asnsIn);

            if (relevantVrps.length) {

                return (this.checkOnlyASns ? Promise.resolve([]) : this._checkExpirationPrefixes(relevantVrps, metadata, roaExpirationAlertHours))
                    .then(alerts => {
                        return batchPromises(1, asnsIn, asn => this._checkExpirationAs(relevantVrps, asn, alerts, metadata, roaExpirationAlertHours));
                    });
            }
        }
    };

    _getExpiringItems = (vrps) => {

        if (this.enableAdvancedRpkiStats) {
            const uniqItems = {};
            const items = vrps.slice(0, 40).filter(vrp => vrp && vrp?.expires);

            return batchPromises(1, items, vrp => {
                return this.rpki.getExpiringElements(vrp, vrp?.expires)
                    .then(expiring => {
                        for (let item of expiring) {
                            uniqItems[item.hash_id] = item;
                        }
                    });
            })
                .then(() => {
                    const items = Object.values(uniqItems);
                    if (items.length > 0) {
                        return {
                            type: items.every(i => i.type === "roa") ? "roa" : "chain",
                            expiring: items.map(i => i.file)
                        };
                    } else {
                        return Promise.reject("Not found yet");
                    }
                });
        } else {
            return Promise.resolve({});
        }
    };

    _checkExpirationPrefixes = (vrps, metadata, roaExpirationAlertHours) => {
        let alerts = [];

        return Promise.all([...new Set(vrps.map(i => i.prefix))]
            .map(prefix => {
                const roas = vrps.filter(i => ipUtils.isEqualPrefix(i.prefix, prefix)); // Get only the ROAs for this prefix
                const matchedRules = this.getMoreSpecificMatches(prefix, false); // Get the matching rule

                return Promise
                    .all(matchedRules
                        .map(matchedRule => {
                            return this._getExpiringItems(roas)
                                .then(extra => {
                                    const alertsStrings = [...new Set(roas.map(this._roaToString))].sort();
                                    let message = "";

                                    if (extra && extra.type === "chain") {
                                        message = `The following ROAs will become invalid in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}.`;
                                        message += ` The reason is the expiration of the following parent components: ${extra.expiring.join(", ")}`;
                                    } else {
                                        message = `The following ROAs will expire in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}`;
                                    }
                                    alerts = alerts.concat(alertsStrings);

                                    this.publishAlert(md5(alertsStrings.join(",")), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                                        matchedRule.prefix,
                                        matchedRule,
                                        message,
                                        {
                                            ...extra,
                                            vrps,
                                            roaExpirationHours: roaExpirationAlertHours,
                                            rpkiMetadata: metadata,
                                            subType: "roa-expire"
                                        });
                                })
                                .catch(error => {

                                    this.logger.log({
                                        level: "error",
                                        message: error
                                    });
                                });
                        }));
            }))
            .then(() => alerts);
    };

    _checkExpirationAs = (vrps, asn, sent, metadata, roaExpirationAlertHours) => {
        try {
            let alerts = [];
            const impactedASes = [...new Set(vrps.map(i => i.asn))];
            const matchedRules = impactedASes.map(asn => this.getMonitoredAsMatch(new AS(asn)));

            for (let matchedRule of matchedRules.filter(i => !!i)) { // An alert for each AS involved (they may have different user group)
                const unsentVrps = vrps.filter(i => !sent.includes(this._roaToString(i)));
                const alertsStrings = [...new Set(unsentVrps.map(this._roaToString))].sort();
                if (alertsStrings.length) {
                    this._getExpiringItems(vrps)
                        .then(extra => {
                            let message = "";

                            if (extra && extra.type === "chain") {
                                message = `The following ROAs will become invalid in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}.`;
                                message += ` The reason is the expiration of the following parent components: ${extra.expiring.join(", ")}`;
                            } else {
                                message = `The following ROAs will expire in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}`;
                            }

                            alerts = alerts.concat(alertsStrings);

                            this.publishAlert(md5(alertsStrings.join(",")), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                                matchedRule.asn.getId(),
                                matchedRule,
                                message,
                                {
                                    ...extra,
                                    vrps: unsentVrps,
                                    roaExpirationHours: roaExpirationAlertHours,
                                    rpkiMetadata: metadata,
                                    subType: "roa-expire"
                                });
                        })
                        .catch(error => {

                            this.logger.log({
                                level: "error",
                                message: error
                            });
                        });
                }
            }

            return alerts;
        } catch (error) {
            this.logger.log({
                level: "error",
                message: error
            });
        }
    };

    _diffVrps = () => {
        const newVrps = this.rpki.getVRPs(); // Get all the vrps as retrieved from the rpki validator

        if (this.enableDiffAlerts) {
            if (this._oldVrps) { // No diff if there were no vrps before

                this.logger.log({
                    level: "info",
                    message: "Performing diff on VRPs"
                });

                const prefixesIn = this.monitored.prefixes.map(i => i.prefix);
                const asns = this.monitored.asns.map(i => i.asn.getValue());
                let alerts = [];
                if (!this.checkOnlyASns) {
                    alerts = this._diffVrpsPrefixes(this._oldVrps, newVrps, prefixesIn);
                }
                for (let asn of asns) {
                    this._diffVrpsAs(this._oldVrps, newVrps, asn, alerts);
                }
            }

            if (newVrps.length) {
                this._oldVrps = newVrps;
            }
        }
    };

    _diffVrpsPrefixes = (oldVrps, newVrps, prefixesIn) => {
        try {
            const roaDiff = diff(oldVrps, newVrps, [], prefixesIn);
            let alerts = [];

            if (roaDiff && roaDiff.length) { // Differences found
                for (let prefix of [...new Set(roaDiff.map(i => i.prefix))]) {

                    const roas = roaDiff.filter(i => ipUtils.isEqualPrefix(i.prefix, prefix)); // Get only the ROAs for this prefix
                    const matchedRules = this.getMoreSpecificMatches(prefix, false); // Get the matching rule

                    for (let matchedRule of matchedRules) {
                        const alertsStrings = [...new Set(roas.map(this._roaToString))].sort();
                        const message = alertsStrings.length <= 10 ?
                            `ROAs change detected: ${alertsStrings.join("; ")}` :
                            `ROAs change detected: ${alertsStrings.slice(0, 10).join("; ")} and more...`;

                        alerts = alerts.concat(alertsStrings);
                        const metadata = this.rpki.getMetadata();

                        this.publishAlert(md5(alertsStrings.join(",")), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                            matchedRule.prefix,
                            matchedRule,
                            message,
                            {
                                diff: alertsStrings,
                                subType: "roa-diff",
                                rpkiMetadata: metadata
                            });
                    }
                }
            }

            return alerts;
        } catch (error) {
            this.logger.log({
                level: "error",
                message: error
            });
        }
    };

    _diffVrpsAs = (oldVrps, newVrps, asn, sent) => {
        try {
            const roaDiff = diff(oldVrps, newVrps, asn, []);
            let alerts = [];

            if (roaDiff && roaDiff.length) { // Differences found

                const impactedASes = [...new Set(roaDiff.map(i => i.asn))];
                const matchedRules = impactedASes.map(asn => this.getMonitoredAsMatch(new AS(asn)));

                for (let matchedRule of matchedRules.filter(i => !!i)) { // An alert for each AS involved (they may have different user group)
                    const alertsStrings = [...new Set(roaDiff.map(this._roaToString))].filter(i => !sent.includes(i)).sort();
                    if (alertsStrings.length) {
                        const message = alertsStrings.length <= 10 ?
                            `ROAs change detected: ${alertsStrings.join("; ")}` :
                            `ROAs change detected: ${alertsStrings.slice(0, 10).join("; ")} and more...`;
                        alerts = alerts.concat(alertsStrings);
                        const metadata = this.rpki.getMetadata();

                        this.publishAlert(md5(alertsStrings.join(",")), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                            matchedRule.asn.getId(),
                            matchedRule,
                            message,
                            {
                                diff: alertsStrings,
                                subType: "roa-diff",
                                rpkiMetadata: metadata
                            });
                    }
                }
            }

            return alerts;
        } catch (error) {
            this.logger.log({
                level: "error",
                message: error
            });
        }
    };

    _roaToString = (roa) => {
        if (roa.status) {
            return `${roa.status} <${roa.prefix}, ${roa.asn}, ${roa.maxLength}, ${roa.ta || ""}>`;
        } else {
            return `<${roa.prefix}, ${roa.asn}, ${roa.maxLength}, ${roa.ta || ""}>`;
        }
    };

    updateMonitoredResources = () => {
        this.monitored = {
            asns: this.input.getMonitoredASns(),
            prefixes: this.input.getMonitoredPrefixes()
        };
    };

    filter = (message) => false;

    squashAlerts = (alerts) => {
        return (alerts[0]) ? alerts[0].matchedMessage : false;
    };

    monitor = (message) => {
        return Promise.resolve(true);
    };
}
