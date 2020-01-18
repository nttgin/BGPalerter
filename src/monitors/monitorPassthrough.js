import Monitor from "./monitor";

export default class monitorPassthrough extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.count = 0;
    };

    filter = () => {
        return true
    };

    squashAlerts = (alerts) => {
        return JSON.stringify(alerts[0]);
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {
            const prefix = message.prefix;
            this.publishAlert(this.count,
                prefix,
                {},
                message,
                {});

            this.count++;

            resolve(true);

        });



}
