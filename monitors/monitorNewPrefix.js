import Monitor from "./monitor";
import ipUtils from "../ipUtils";
import ip from "ip";

export default class MonitorNewPrefix extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.updateMonitoredPrefixes();
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredMoreSpecifics();
    };

    filter = (message) => {
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {
        return alerts[0].message;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {

            const messagePrefix = message.prefix;

            let matches = this.monitored.filter(item => {
                const sameOrigin = message.originAs == item.asn;
                return sameOrigin &&
                    item.prefix != messagePrefix &&
                    ip.cidrSubnet(item.prefix).contains(messagePrefix);
            });
            if (matches.length > 1) {
                matches = [matches.sort((a, b) => ipUtils.sortByPrefixLength(a.prefix, b.prefix)).pop()];
            }

            if (matches.length !== 0) {
                const match = matches[0];
                const text = `Possible change of configuration. A new prefix ${message.prefix} is announced by AS${match.asn}. It should be instead ${match.prefix} (${match.description}) announced by AS${match.asn}`;

                this.publishAlert(message.originAs + "-" + message.prefix,
                    text,
                    match.asn,
                    matches[0],
                    message,
                    {});
            }

            resolve(true);
        });

}