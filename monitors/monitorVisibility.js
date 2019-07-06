import Monitor from "./monitor";
import ipUtils from "../ipUtils";

export default class MonitorVisibility extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredMoreSpecifics();
    };

    filter = (message) => {
        return message.type === 'withdrawal';
    };

    squashAlerts = (alerts) => {
        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;
        return `The prefix ${alerts[0].matchedMessage.prefix} has been withdrawn. It is no longer visible from ${peers} peer(s).`;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {

            const messagePrefix = message.prefix;

            let matches = this.monitored.filter(item => {
                return item.prefix === messagePrefix;
            });
            if (matches.length > 1) {
                matches = [matches.sort((a, b) => ipUtils.sortByPrefixLength(a.prefix, b.prefix)).pop()];
            }

            if (matches.length !== 0) {
                const match = matches[0];
                this.publishAlert(match.prefix,
                    `The prefix ${match.prefix} has been withdrawn.`,
                    match.asn,
                    matches[0],
                    message,
                    {});
            }

            resolve(true);
        });

}