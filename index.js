import { config, logger, input } from "./env";
import cluster from "cluster";
import Consumer from "./consumer";
import ConnectorFactory from "./connectorFactory";

if (cluster.isMaster) {

    const worker = cluster.fork();


    const connectorFactory = new ConnectorFactory();

    connectorFactory.loadConnectors();
    connectorFactory.connectConnectors()
        .then(() => {

            for (const connector of connectorFactory.getConnectors()) {
                connector.onMessage((message) => {
                    worker.send(connector.name + "-" + message);
                });
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


} else {
    new Consumer();
}
