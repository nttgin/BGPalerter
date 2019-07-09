import { config, logger, input, pubSub } from "./env";
import Consumer from "./consumer";
import ConnectorFactory from "./connectorFactory";
import cluster from "cluster";


function master(worker) {

    const connectorFactory = new ConnectorFactory();

    connectorFactory.loadConnectors();
    return connectorFactory.connectConnectors()
        .then(() => {

            for (const connector of connectorFactory.getConnectors()) {

                if (worker){
                    connector.onMessage((message) => {
                        worker.send(connector.name + "-" + message);
                    });
                } else {
                    connector.onMessage((message) => {
                        pubSub.publish("data", connector.name + "-" + message);
                    });
                }

                connector.onError(error => {
                    logger.log({
                        level: 'error',
                        message: error
                    });
                });
                connector.onConnect(error => {
                    logger.log({
                        level: 'info',
                        message: error
                    });
                });
            }
        })
        .then(() => connectorFactory.subscribeConnectors(input))
        .catch(error => {
            logger.log({
                level: 'error',
                message: error
            });
        });
}

module.exports = pubSub;

console.log("RUNNING ENVIRONMENT:", config.environment);
if (config.environment === "test") {

    master();
    new Consumer();

} else {
    if (cluster.isMaster) {
        master(cluster.fork());
    } else {
        new Consumer();
    }
}
