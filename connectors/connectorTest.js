import WebSocket from "ws";

export default class ConnectorRIS extends Connector{

    constructor(params, env) {
        super(params, env);
    }

    connect = () => {

        // const ws = new WebSocket(this.params.url);
        //
        // ws.on('message', this.message);
        //
        // ws.on('open', () => {
        //
        // });
        //
        // ws.on('close', this.close);

        new Promise((resolve, reject) => reject(new Error('The method connect has to be implemented')));
    };

    subscribe = (input) => {
        ws.send(JSON.stringify({
            type: "ris_subscribe",
            data: this.params
        }));
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
    };

}