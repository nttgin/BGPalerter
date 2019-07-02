import Monitor from "./monitor";
import ipUtils from "../ipUtils";
import ip from "ip";

export default class MonitorHijack extends Monitor {

    constructor(name, channel, env){
        super(name, channel, env);
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

    monitor = (message) => new Promise((resolve, reject) => {

        const messagePrefix = message.prefix;

        let matches = this.monitored.filter(item => {
            return item.prefix === messagePrefix || ip.cidrSubnet(item.prefix).contains(messagePrefix);
        });
        if (matches.length > 1) {
            matches = [matches.sort((a, b) => ipUtils.sortByPrefixLength(a.prefix, b.prefix)).pop()];
        }

        if (matches.length !== 0) {
            const match = matches[0];
            this.publishAlert(message.originAs + "-" + match.prefix,
                `The prefix ${match.prefix} is announced by the AS${message.originAs} instead of AS${match.asn}`,
                match.asn,
                {
                    rule: matches[0],
                    received: message
                });
        }

        resolve(true);
    });

}