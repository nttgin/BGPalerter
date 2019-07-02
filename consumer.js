import { config, logger, monitors } from "./env";

export default class Consumer {

    constructor(){
        process.on('message', this.dispatch);
    };

    dispatch = (data) => {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case "ris_message": this.handleUpdate(message)
            }
        } catch (error) {
            logger.log({
                level: 'error',
                message: error
            });
        }
    };

    handleUpdate = (data) => {
        const messages = this.transform(data);
        for (let monitor of monitors) {

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


