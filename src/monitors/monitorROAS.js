import Monitor from "./monitor";
import md5 from "md5";
import { getRelevant, diff } from "../utils/rpkiDiffingTool";
import {AS} from "../model";
import moment from "moment";

export default class MonitorROAS extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);
        this.logger = env.logger;
        this.rpki = env.rpki;

        // Enabled checks
        this.enableDiffAlerts = params.enableDiffAlerts != null ? params.enableDiffAlerts : true;
        this.enableExpirationAlerts = params.enableExpirationAlerts != null ? params.enableExpirationAlerts : true;
        this.enableExpirationCheckTA = params.enableExpirationCheckTA != null ? params.enableExpirationCheckTA : true;
        this.enableDeletedCheckTA = params.enableDeletedCheckTA != null ? params.enableDeletedCheckTA : true;

        // Default parameters
        this.roaExpirationAlertHours = params.roaExpirationAlertHours || 2;
        this.checkOnlyASns = params.checkOnlyASns != null ? params.checkOnlyASns : true;

        this.toleranceExpiredRoasTA = params.toleranceExpiredRoasTA || 20;
        this.toleranceDeletedRoasTA = params.toleranceDeletedRoasTA || 20;
        this.timesDeletedTAs = {};
        this.seenTAs = {};
        this.monitored = {
            asns: [],
            prefixes: []
        };

        if (this.enableDiffAlerts || this.enableDeletedCheckTA) {
            setInterval(this._diffVrps, 30 * 1000);
        }
        if (this.enableExpirationAlerts || this.enableExpirationCheckTA) {
            setInterval(() => {
                this.rpki._getVrpIndex()
                    .then(index => {
                        this._verifyExpiration(index, this.roaExpirationAlertHours);
                    })
                    .catch((e) => {
                        console.log(e);
                        this._verifyExpiration(null, 2, false);
                    });
            }, global.EXTERNAL_ROA_EXPIRATION_TEST || 600000);
        }
    };

    _calculateSizes = (vrps) => {
        const times = {};

        for (let ta in this.seenTAs) {
            times[ta] = 0;
        }

        for (let vrp of vrps) {
            times[vrp.ta] = times[vrp.ta] || 0;
            times[vrp.ta]++
            this.seenTAs[vrp.ta] = true;
        }

        return times;
    };

    _checkDeletedRoasTAs = (vrps) => {
        const sizes =  this._calculateSizes(vrps);

        for (let ta in sizes) {
            if (this.timesDeletedTAs[ta]) {
                const min = Math.min(this.timesDeletedTAs[ta], sizes[ta]);
                const max = Math.max(this.timesDeletedTAs[ta], sizes[ta]);
                const diff = max - min;
                const percentage = 100 / max * diff;

                if (percentage > this.toleranceDeletedRoasTA) {
                    const message = `Possible TA malfunction or incomplete VRP file: ${percentage.toFixed(2)}% of the ROAs disappeared from ${ta}`;

                    this.publishAlert(`disappeared-${ta}`, // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                        ta,
                        {
                            group: "default"
                        },
                        message,
                        {});
                }
            }
        }
        this.timesDeletedTAs = sizes;
    };

    _checkExpirationTAs = (vrps, expiringVrps, index) => {
        const sizes =  this._calculateSizes(vrps);
        const expiringSizes =  this._calculateSizes(expiringVrps);

        for (let ta in sizes) {
            const min = expiringSizes[ta];
            const max = sizes[ta];
            const percentage = (100 / max) * min;

            if (percentage > this.toleranceExpiredRoasTA) {
                const currentTaVrps = vrps.filter(i => i.ta === ta);
                const extra = this._getExpiringItems(currentTaVrps, index);

                const message = `Possible TA malfunction or incomplete VRP file: ${percentage.toFixed(2)}% of the ROAs are expiring in ${ta}`;

                this.publishAlert(`expiring-${ta}`, // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                    ta,
                    { group: "default" },
                    message,
                    extra);
            }
        }
    };

    _verifyExpiration = (index, roaExpirationAlertHours) => {
        const roas = this.rpki.getVRPs();
        const metadata = this.rpki.getMetadata();
        const expiringRoas = roas
            .filter(i => !!i.expires && (i.expires - moment.utc().unix()  < roaExpirationAlertHours * 3600));

        if (this.enableExpirationCheckTA) {
            this._checkExpirationTAs(roas, expiringRoas, index); // Check for TA malfunctions
        }

        if (this.enableExpirationAlerts) {
            const prefixesIn = this.monitored.prefixes.map(i => i.prefix);
            const asnsIn = this.monitored.asns.map(i => i.asn.getValue());
            const relevantVrps = getRelevant(expiringRoas, prefixesIn, asnsIn);

            let alerts = [];
            if (relevantVrps.length) {
                if (!this.checkOnlyASns) {
                    alerts = this._checkExpirationPrefixes(relevantVrps, metadata, index, roaExpirationAlertHours);
                }
                for (let asn of asnsIn) {
                    this._checkExpirationAs(relevantVrps, asn, alerts, metadata, index, roaExpirationAlertHours);
                }
            }
        }
    };

    _getExpiringItems = (vrps, index) => {

        if (index) {
            const uniqItems = {};
            for (let vrp of vrps.slice(0, 20)) {
                if (vrp && vrp?.expires) {
                    const expiring = this.rpki.getExpiringElements(index, vrp, vrp?.expires);

                    for (let item of expiring) {
                        uniqItems[item.id] = item;
                    }
                }
            }

            const items = Object.values(uniqItems);

            return {
                type: items.every(i => i.type === "roa") ? "roa" : "chain",
                expiring: items.map(i => i.file)
            };
        } else {
            return {};
        }
    }

    _checkExpirationPrefixes = (vrps, metadata, index, roaExpirationAlertHours) => {
        let alerts = [];

        for (let prefix of [...new Set(vrps.map(i => i.prefix))]) {

            const roas = vrps.filter(i => i.prefix === prefix); // Get only the ROAs for this prefix
            const matchedRule = this.getMoreSpecificMatch(prefix, false); // Get the matching rule
            if (matchedRule) {
                const extra = this._getExpiringItems(roas, index);
                const alertsStrings = [...new Set(roas.map(this._roaToString))];
                let message = "";

                if (extra && extra.type === "chain") {
                    message = `The following ROAs will become invalid in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}.`
                    message += ` The reason is the expiration of the following parent components: ${extra.expiring.join(", ")}`;
                } else {
                    message = `The following ROAs will expire in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}`;
                }
                alerts = alerts.concat(alertsStrings);

                this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                    matchedRule.prefix,
                    matchedRule,
                    message,
                    {...extra, rpkiMetadata: metadata});
            }
        }

        return alerts;
    };

    _checkExpirationAs = (vrps, asn, sent, metadata, index, roaExpirationAlertHours) => {
        try {
            let alerts = [];
            const impactedASes = [...new Set(vrps.map(i => i.asn))];
            const matchedRules = impactedASes.map(asn => this.getMonitoredAsMatch(new AS(asn)));

            for (let matchedRule of matchedRules.filter(i => !!i)) { // An alert for each AS involved (they may have different user group)
                const alertsStrings = [...new Set(vrps.map(this._roaToString))].filter(i => !sent.includes(i));
                if (alertsStrings.length) {
                    const extra = this._getExpiringItems(vrps, index);
                    let message = "";

                    if (extra && extra.type === "chain") {
                        message = `The following ROAs will become invalid in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}.`
                        message += ` The reason is the expiration of the following parent components: ${extra.expiring.join(", ")}`;
                    } else {
                        message = `The following ROAs will expire in less than ${roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}`;
                    }

                    alerts = alerts.concat(alertsStrings);

                    this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                        matchedRule.asn.getId(),
                        matchedRule,
                        message,
                        {...extra, rpkiMetadata: metadata});
                }
            }

            return alerts;
        } catch (error) {
            this.logger.log({
                level: 'error',
                message: error
            });
        }
    };

    _diffVrps = () => {
        const newVrps = this.rpki.getVRPs(); // Get all the vrps as retrieved from the rpki validator

        if (this.enableDeletedCheckTA) {
            this._checkDeletedRoasTAs(newVrps); // Check for TA malfunctions for too many deleted roas
        }

        if (this.enableDiffAlerts) {
            if (this._oldVrps) { // No diff if there were no vrps before
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

                    const roas = roaDiff.filter(i => i.prefix === prefix); // Get only the ROAs for this prefix
                    const matchedRule = this.getMoreSpecificMatch(prefix, false); // Get the matching rule
                    if (matchedRule) {
                        const alertsStrings = [...new Set(roas.map(this._roaToString))];
                        const message = `ROAs change detected: ${alertsStrings.join("; ")}`;
                        alerts = alerts.concat(alertsStrings);

                        this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                            matchedRule.prefix,
                            matchedRule,
                            message,
                            {});
                    }
                }
            }

            return alerts;
        } catch (error) {
            this.logger.log({
                level: 'error',
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
                    const alertsStrings = [...new Set(roaDiff.map(this._roaToString))].filter(i => !sent.includes(i));
                    if (alertsStrings.length) {
                        const message = `ROAs change detected: ${alertsStrings.join("; ")}`;
                        alerts = alerts.concat(alertsStrings);

                        this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                            matchedRule.asn.getId(),
                            matchedRule,
                            message,
                            {});
                    }
                }
            }

            return alerts;
        } catch (error) {
            this.logger.log({
                level: 'error',
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
        }
    };

    filter = (message) => false;

    squashAlerts = (alerts) => {
        return (alerts[0]) ? alerts[0].matchedMessage : false;
    };

    monitor = (message) => {
        return Promise.resolve(true);
    };
}
