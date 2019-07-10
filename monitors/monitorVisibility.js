import Monitor from "./monitor";
import ipUtils from "../ipUtils";

export default class MonitorVisibility extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.threshold = (params.threshold != null) ? params.threshold : 10;
        this.updateMonitoredPrefixes();
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredPrefixes();
        this.monitoredSimpleArray = this.monitored.map(item => item.prefix);
    };

    filter = (message) => {
        // Based on exact match only
        return message.type === 'withdrawal'
            && this.monitoredSimpleArray.includes(message.prefix);
    };

    squashAlerts = (alerts) => {
        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;

        if (peers >= this.threshold) {
            return (peers === 1) ?
                `The prefix ${alerts[0].matchedMessage.prefix} (${alerts[0].matchedRule.description}) it's no longer visible (withdrawn) from the peer ${alerts[0].matchedMessage.peer}.` :
                `The prefix ${alerts[0].matchedMessage.prefix} (${alerts[0].matchedRule.description}) has been withdrawn. It is no longer visible from ${peers} peers.`;
        } else {
            return false;
        }
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {

            const messagePrefix = message.prefix;

            let matches = this.monitored.filter(item => {
                return item.prefix == messagePrefix;
            });
            if (matches.length > 1) {
                matches = [matches.sort((a, b) => ipUtils.sortByPrefixLength(a.prefix, b.prefix)).pop()];
            }

            if (matches.length !== 0) {
                const match = matches[0];
                let key = match.prefix;

                this.publishAlert(key,
                    `The prefix ${match.prefix} has been withdrawn.`,
                    match.asn,
                    matches[0],
                    message,
                    {});
            }

            resolve(true);
        });

}