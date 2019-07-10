import Connector from "./connector";

export default class ConnectorTest extends Connector{

    static isTest = true;

    constructor(name, params, env) {
        super(name, params, env);
        console.log("Test connector running");
        this.pubSub.subscribe("test-type", (type, message) => {
            clearInterval(this.timer);
            this.subscribe({type: message});
            console.log("switching to", message);
        });
    }

    connect = () =>
        new Promise((resolve, reject) => {
            resolve(true);
        });

    subscribe = (params) =>
        new Promise((resolve, reject) => {
            resolve(true);

            const type = params.type || this.params.testType;

            let update;

            switch (type) {
                case "hijack":
                    update = {
                        data: {
                            announcements: [{
                                prefixes: ["180.50.120.0/22"],
                                next_hop: "124.0.0.2"
                            }],
                            peer: "124.0.0.2",
                            path: "1,2,3,4".split(",")
                        },
                        type: "ris_message"
                    };
                    break;

                case "newprefix":
                    update = {
                        data: {
                            announcements: [{
                                prefixes: ["180.50.120.0/22"],
                                next_hop: "124.0.0.2"
                            }],
                            peer: "124.0.0.2",
                            path: "1,2,3,4713".split(",")
                        },
                        type: "ris_message"
                    };
                    break;

                default:
                    update = {
                        data: {
                            withdrawals: ["124.40.52.128/26"],
                            peer: "124.0.0.2"
                        },
                        type: "ris_message"
                    };
            }

            this.timer = setInterval(() => {
                this.message(JSON.stringify(update));
                if (type === 'withdrawal') {
                    let peer = update.data.peer.split('.');
                    peer[3] = Math.min(parseInt(peer[3]) + 1, 254);
                    update.data.peer = peer.join(".");
                }
            }, 1000);

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