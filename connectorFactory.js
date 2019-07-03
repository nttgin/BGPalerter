import env from "./env";

export default class ConnectorFactory {

    constructor() {
        this.disconnected = [];
        this.connected = [];

    }

    loadConnectors = () => {
        if (this.disconnected.length === 0) {
            this.disconnected = config.reports.map(connector => new connector.class(connector.params, env));
        }
    };

    connectConnectors = () =>
        Promise.all(this.disconnected.map(connector => {
            connector.connect()
                .then(() => {
                    this.connected.push();
                });
        }));

    subscribeConnectors = (params) =>
        new Promise((resolve, reject) => {

            if (this.connectors.length === 0) {
                reject(new Error("No connectors loaded"));
            } else {

                resolve(Promise.all(this.connectors.map(connector => connector.subscribe(params))));
            }

        });
}