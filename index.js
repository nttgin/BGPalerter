import { config, logger, input } from "./env";
import cluster from "cluster";
import WebSocket from "ws";
import sleep from "sleep";
import Consumer from "./consumer";
import ConnectorFactory from "./connectorFactory";

if (cluster.isMaster) {

    const worker = cluster.fork();


    const connectorFactory = new ConnectorFactory();

    connectorFactory.loadConnectors();
    connectorFactory.connectConnectors()
        .then(() => connectorFactory.subscribeConnectors(input))
        .then(() => {

            for (const connector of connectorFactory.getConnectors()) {
                connector.onMessage((message) => {
                    worker.send(message);
                });
                connector.onError(error => {
                    logger.log({
                        level: 'error',
                        message: error
                    });
                });

            }
        })
        .catch(error => {
            logger.log({
                level: 'error',
                message: error
            });
        });


} else {
    new Consumer();
}
