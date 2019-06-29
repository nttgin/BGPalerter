import config from "./config";
import pubSub from 'pubsub-js';
import logger from './logger';

export default class Consumer {

    constructor(inputManager){
        process.on('message', this.dispatch);
        this.monitors = config.monitors.map(monitor =>
            new monitor.class(inputManager, monitor.name, monitor.channel, config, pubSub));

        this.reports = config.reports.map(report =>
            new report.class(report.channels, config, pubSub));

    };

    dispatch = (data) => {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case "ris_message": this.handleUpdate(message)
            }
        } catch (error) {
            // Don't do anything
        }
    };

    handleUpdate = (data) => {
        const messages = this.transform(data);
        for (let monitor of this.monitors) {

            // Blocking filtering to reduce stack usage
            for (const message of messages.filter(monitor.filter)) {

                // Promise call to reduce waiting times
                monitor.monitor(message)
                    .catch(error => {
                        logger.log({
                            level: 'error',
                            message: error
                        });
                    });
            }
        }
    };

    transform = (message) => {
        message = message.data;
        const components = [];
        const announcements = message["announcements"] || [];
        const withdrawals = message["withdrawals"] || [];
        const peer = message["peer"];
        const path = message["path"];

        for (let announcement of announcements){
            const nextHop = announcement["next_hop"];
            const prefixes = announcement["prefixes"] || [];

            for (let prefix of prefixes){
                components.push({
                    type: "announcement",
                    prefix,
                    peer,
                    path,
                    originAs: path[path.length - 1],
                    nextHop
                })
            }
        }

        for (let prefix of withdrawals){
            components.push({
                type: "withdrawal",
                prefix,
                peer

            })
        }

        return components;
    }

}


