import Monitor from "./monitor";
import ip from "ip";

export default class MonitorHijack extends Monitor {

    constructor(inputManager, name, channel){
        super(inputManager, name, channel);
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


    monitor = (message) => {
        const messagePrefix = message.prefix;

        for (let item of this.monitored) {
            const prefix = item.prefix;

            if (prefix === messagePrefix) {
                if (message.originAs !== item.asn) {
                    this.publishAlert(`The prefix ${prefix} is announced by the AS${message.originAs} 
                    instead of AS${item.asn}`,);
                }

            } else if (ip.cidrSubnet(prefix).contains(messagePrefix)) {

            }
        }
    };

}