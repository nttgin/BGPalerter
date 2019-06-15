import config from "./config";

export default class Consumer {
    constructor(){
        process.on('message', this.dispatch);
        this.monitors = config.monitors.map(monitor => new monitor());
    };

    dispatch = (data) => {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case "ris_message": this.handleUpdate(message)
            }
        } catch (e) {
            console.log(e);
        }
    };

    handleUpdate = (data) => {
        const messages = this.transform(data);
        for (let monitor of this.monitors){
            for (const message of messages){
                monitor.monitor(message);
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


