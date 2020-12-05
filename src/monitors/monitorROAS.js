import Monitor from "./monitor";
import md5 from "md5";
import diff from "../utils/rpkiDiffingTool";
import {AS} from "../model";

export default class MonitorROAS extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);

        this.logger = env.logger;
        this.rpki = env.rpki;
        setInterval(this._diffVrps, 20000);
    };

    _diffVrps = () => {
        try {
            let roaDiff;
            const newVrps = this.rpki.getVrps(); // Get all the vrps as retrieved from the rpki validator

            if (this._oldVrps) { // No diff if there were no vrps before
                roaDiff = [].concat.apply([], this.monitored
                    .map(i => diff(this._oldVrps, newVrps, i.asn.getValue()))); // Get the diff for each monitored AS
            }

            if (newVrps.length) {
                this._oldVrps = newVrps;
            }

            if (roaDiff && roaDiff.length) { // Differences found
                const impactedASes = [...new Set(roaDiff.map(i => i.asn))];
                const matchedRules = impactedASes.map(asn => this.getMonitoredAsMatch(new AS(asn)));

                for (let matchedRule of matchedRules.filter(i => !!i)) { // An alert for each AS involved (they may have different user group)
                    const message = "ROAs change detected: " + [...new Set(roaDiff.map(this._roaToString))].join("; ");

                    this.publishAlert(md5(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                        matchedRule.asn.getId(),
                        matchedRule,
                        message,
                        {});
                }
            }
        } catch (error) {
            this.logger.log({
                level: 'error',
                message: error
            });
        }
    };

    _roaToString = (roa) => {
        return `${roa.status} <${roa.prefix}, ${roa.asn}, ${roa.maxLength}, ${roa.ta || ""}>`;
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredASns();
    };

    filter = (message) => false;

    squashAlerts = (alerts) => {
        return (alerts[0]) ? alerts[0].matchedMessage : false;
    };

    monitor = (message) => {
        return Promise.resolve(true);
    };
}
