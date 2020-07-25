import Monitor from "./monitor";

export default class monitorPassthrough extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.count = 0;
    };

    updateMonitoredResources = () => {
        // nothing
    };

    filter = () => {
        return true
    };

    squashAlerts = (alerts) => {
        const item = alerts[0].matchedMessage;
        return `type:${item.type} timestamp:${alerts[0].timestamp} prefix:${item.prefix} peer:${item.peer} path:${item.path} nextHop:${item.nextHop} aggregator:${item.aggregator}`;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {
            const prefix = message.prefix;
            this.publishAlert(this.count,
                prefix,
                {
                    prefix: "0.0.0.0/0",
                    asn: "1234",
                    description: "test",
                },
                message,
                {});

            this.count++;

            resolve(true);

        });



}
