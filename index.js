// import os from "os";
import config from "./config";
import cluster from "cluster";
import WebSocket from "ws";
import sleep from "sleep";
import Consumer from "./consumer";
import InputManager from "./inputManager";


const inputManager = new InputManager(config);

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

        const ws = new WebSocket("wss://ris-live.ripe.net/v1/ws/");

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
            console.log('Disconnected');
        });
    }

} else {
    new Consumer(inputManager)
}
