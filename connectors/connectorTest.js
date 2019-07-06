import sleep from "sleep";
import Connector from "./connector";

export default class ConnectorTest extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
    }

    connect = () =>
        new Promise((resolve, reject) => {
            resolve(true);
        });

    subscribe = (input) =>
        new Promise((resolve, reject) => {
            resolve(true);

            const update = (this.params.testType === 'withdrawal') ?
                {
                    data: {
                        withdrawals: ["124.40.52.128/26"],
                        peer: "124.0.0.2"
                    },
                    type: "ris_message"
                } :
                {
                    data: {
                        announcements: [{
                            prefixes: ["124.40.52.0/22"],
                            next_hop: "124.0.0.2"
                        }],
                        peer: "124.0.0.2",
                        path: "1,2,3,2914".split(",")
                    },
                    type: "ris_message"
                };

            const message = JSON.stringify(update);

            while (true){
                this.message(message);
                sleep.sleep(1);
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
    };
}