import env from "./env";

export default class ConnectorFactory {

    constructor() {
        this.connectors = {};
    }

    getConnector = (name) => {
        return this.connectors[name];
    };

    getConnectors = () => {
        return Object.keys(this.connectors).map(name => this.connectors[name]);
    };

    loadConnectors = () => {
        const connectors = Object.keys(this.connectors);
        if (connectors.length === 0) {

            for (let connector of env.config.connectors) {
                this.connectors[connector.name] = new connector.class(connector.params, env);
            }
        }
    };

    connectConnectors = () =>
        new Promise((resolve, reject) => {
            const connectors = this.getConnectors();

            if (connectors.length === 0) {
                reject(new Error("No connections available"));

            } else {
                resolve(Promise.all(connectors
                    .map(connector =>
                        new Promise((resolve, reject) => {
                            connector.connect()
                                .then(() => {
                                    connector.connected = true;
                                    resolve(true);
                                })
                                .catch((error) => {
                                    env.logger.log({
                                        level: 'error',
                                        message: error
                                    });
                                    resolve(false);
                                })
                        }))));
            }
        });

    subscribeConnectors = (params, callback) =>
        new Promise((resolve, reject) => {

            const connectors = this.getConnectors();

            if (connectors.length === 0) {
                reject(new Error("No connections available"));
            } else {
                resolve(Promise.all(connectors.map(connector => {
                    connector.subscribe(params);
                })));
            }

        });
}