import env from "./env";

export default class Consumer {

    constructor(){
        this.connectors = {};
        for (let connector of env.config.connectors) {
            this.connectors[connector.name] = connector.class
        }


        this.monitors = env.config.monitors
            .map(monitor => new monitor.class(monitor.name, monitor.channel, monitor.params, env));

        this.reports = env.config.reports
            .map(report => new report.class(report.channels, report.params, env));

        process.on('message', this.dispatch);
    };

    dispatch = (data) => {
        try {
            const connector = data.slice(0,3);
            const messagesRaw = JSON.parse(data.slice(4));
            const messages = this.connectors[connector].transform(messagesRaw);

            for (let monitor of this.monitors) {

                // Blocking filtering to reduce stack usage
                for (const message of messages.filter(monitor.filter)) {

                    // Promise call to reduce waiting times
                    monitor
                        .monitor(message)
                        .catch(error => {
                            env.logger.log({
                                level: 'error',
                                message: error
                            });
                        });
                }
            }

        } catch (error) {
            env.logger.log({
                level: 'error',
                message: error
            });
        }
    };

}


