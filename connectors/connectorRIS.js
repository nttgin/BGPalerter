import WebSocket from "ws";
import Connector from "./connector";

export default class ConnectorRIS extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
        this.ws = null;
    }

    connect = () =>
        new Promise((resolve, reject) => {
            try {

                this.ws = new WebSocket(this.params.url);
                this.ws.on('message', this.message);
                this.ws.on('close', this.error);
                this.ws.on('open', () => {
                    resolve(true);
                    this.connected(this.name + ' connector connected');
                });

            } catch(error) {
                this.error(error);
                resolve(false);
            }
        });


    _subscribeToAll = (input) => {
        console.log("Subscribing to everything");
        this.ws.send(JSON.stringify({
            type: "ris_subscribe",
            data: this.params.subscription
        }));

    };

    _subscribeToPrefixes = (input) => {
        const monitoredPrefixes = input.getMonitoredPrefixes().map(item => item.prefix);
        const params = JSON.parse(JSON.stringify(this.params.subscription));
        for (let prefix of monitoredPrefixes){
            params.prefix = prefix;
            console.log("Subscribing to:", prefix);
            this.ws.send(JSON.stringify({
                type: "ris_subscribe",
                data: params
            }));
        }
    };


    subscribe = (input) =>
        new Promise((resolve, reject) => {
            try {
                return (this.params.carefulSubscription) ?
                    this._subscribeToPrefixes(input) :
                    this._subscribeToAll(input);

                resolve(true);
            } catch(error) {
                this.error(error);
                resolve(false);
            }
        });

    static transform = (message) => {
        if (message.type === 'ris_message') {
            message = message.data;
            const components = [];
            const announcements = message["announcements"] || [];
            const withdrawals = message["withdrawals"] || [];
            const peer = message["peer"];
            const path = message["path"];

            for (let announcement of announcements) {
                const nextHop = announcement["next_hop"];
                const prefixes = announcement["prefixes"] || [];

                for (let prefix of prefixes) {
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

            for (let prefix of withdrawals) {
                components.push({
                    type: "withdrawal",
                    prefix,
                    peer
                })
            }

            return components;
        }
    }
};
