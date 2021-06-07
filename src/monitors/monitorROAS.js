import Monitor from "./monitor";
import md5 from "md5";
import { getPrefixes, getRelevant, diff } from "../utils/rpkiDiffingTool";
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
        this.timesExpirationTAs = {};
        this.timesDeletedTAs = {};
        this.monitored = {
            asns: [],
            prefixes: []
        };

        if (this.enableDiffAlerts) {
            setInterval(this._diffVrps, 30000);
        }
        if (this.enableExpirationAlerts) {
            setInterval(this._verifyExpiration, global.EXTERNAL_ROA_EXPIRATION_TEST || 600000);
        }
    };

    _calculateSizes = (vrps) => {
        const times = {};

        for (let vrp of vrps) {
            times[vrp.ta] = times[vrp.ta] || 0;
            times[vrp.ta]++
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
                    const message = `Possible TA malfunction: ${percentage.toFixed(2)}% of the ROAs disappeared from ${ta}`;

                    this.publishAlert(`disappeared-${ta}`, // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                        ta,
                        { group: "default" },
                        message,
                        {});
                }
            }
        }
        this.timesDeletedTAs = sizes;
    };

    _checkExpirationTAs = (vrps) => {
        const sizes =  this._calculateSizes(vrps);

        for (let ta in sizes) {
            if (this.timesExpirationTAs[ta]) {
                const min = Math.min(this.timesExpirationTAs[ta], sizes[ta]);
                const max = Math.min(this.timesExpirationTAs[ta], sizes[ta]);
                const diff = max - min;
                const percentage = 100 / max * diff;

                if (percentage > this.toleranceExpiredRoasTA) {
                    const message = `Possible TA malfunction: ${percentage.toFixed(2)}% of the ROAs are expiring in ${ta}`;

                    this.publishAlert(`expiring-${ta}`, // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                        ta,
                        { group: "default" },
                        message,
                        {});
                }
            }
        }
        this.timesExpirationTAs = sizes;
    };

    _verifyExpiration = () => {
        const vrps = this.rpki.getVrps()
            .filter(i => !!i.expires && (i.expires - moment.utc().unix()  < this.roaExpirationAlertHours * 3600));

        if (this.enableExpirationCheckTA) {
            this._checkExpirationTAs(vrps); // Check for TA malfunctions
        }

        const prefixesIn = this.monitored.prefixes.map(i => i.prefix);
        const asnsIn = this.monitored.asns.map(i => i.asn.getValue());
        const relevantVrps = getRelevant(vrps, prefixesIn, asnsIn);

        let alerts =  [];
        if (relevantVrps.length) {
            if (!this.checkOnlyASns) {
                alerts = this._checkExpirationPrefixes(relevantVrps);
            }
            for (let asn of asnsIn) {
                this._checkExpirationAs(relevantVrps, asn, alerts);
            }
        }
    };

    _checkExpirationPrefixes = (vrps) => {
        let alerts = [];

        for (let prefix of [...new Set(vrps.map(i => i.prefix))]) {

            const roas = vrps.filter(i => i.prefix === prefix); // Get only the ROAs for this prefix
            const matchedRule = this.getMoreSpecificMatch(prefix, false); // Get the matching rule
            if (matchedRule) {
                const alertsStrings = [...new Set(roas.map(this._roaToString))];
                const message = `The following ROAs will expire in less than ${this.roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}`;
                alerts = alerts.concat(alertsStrings);

                this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                    matchedRule.prefix,
                    matchedRule,
                    message,
                    {});
            }
        }

        return alerts;
    };

    _checkExpirationAs = (vrps, asn, sent) => {
        try {
            let alerts = [];
            const impactedASes = [...new Set(vrps.map(i => i.asn))];
            const matchedRules = impactedASes.map(asn => this.getMonitoredAsMatch(new AS(asn)));

            for (let matchedRule of matchedRules.filter(i => !!i)) { // An alert for each AS involved (they may have different user group)
                const alertsStrings = [...new Set(vrps.map(this._roaToString))].filter(i => !sent.includes(i));
                if (alertsStrings.length) {
                    const message = `The following ROAs will expire in less than ${this.roaExpirationAlertHours} hours: ${alertsStrings.join("; ")}`;
                    alerts = alerts.concat(alertsStrings);

                    this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                        matchedRule.asn.getId(),
                        matchedRule,
                        message,
                        {});
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
        const newVrps = this.rpki.getVrps(); // Get all the vrps as retrieved from the rpki validator

        if (this.enableDeletedCheckTA) {
            this._checkDeletedRoasTAs(newVrps); // Check for TA malfunctions for too many deleted roas
        }

        if (this._oldVrps) { // No diff if there were no vrps before
            const prefixesIn = this.monitored.prefixes.map(i => i.prefix);
            const asns = this.monitored.asns.map(i => i.asn.getValue());
            let alerts =  [];
            if (!this.checkOnlyASns){
                alerts = this._diffVrpsPrefixes(this._oldVrps, newVrps, prefixesIn);
            }
            for (let asn of asns) {
                this._diffVrpsAs(this._oldVrps, newVrps, asn, alerts);
            }
        }

        if (newVrps.length) {
            this._oldVrps = newVrps;
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
