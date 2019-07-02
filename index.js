import { config, logger } from "./env";
import cluster from "cluster";
import WebSocket from "ws";
import sleep from "sleep";
import Consumer from "./consumer";

if (cluster.isMaster) {

    const worker = cluster.fork();


    if (config.testMode){
        // const update = {
        //     data: {
        //         withdrawals: ["124.40.52.0/22"],
        //         peer: "124.0.0.2"
        //     },
        //     type: "ris_message"
        // };

        const update = {
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
            worker.send(message);
            sleep.sleep(1);
        }

    } else {

        const ws = new WebSocket(config.websocketDataService);

        ws.on('message', (message) => {
            worker.send(message);
        });

        ws.on('open', () => {
            ws.send(JSON.stringify({
                type: "ris_subscribe",
                data: config.wsParams
            }));
        });

        ws.on('close', function close() {
            logger.log({
                level: 'info',
                message: 'Web socket disconnected'
            });
        });
    }

} else {
    new Consumer();
}
