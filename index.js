// import os from "os";
import config from "./config";
import cluster from "cluster";
import WebSocket from "ws";
import sleep from "sleep";
import Consumer from "./consumer";

if (cluster.isMaster) {

    const worker = cluster.fork();


    if (config.testMode){
        const message = JSON.stringify({
            data: {
                withdrawals: ["123.0.0.1/23"],
                peer: "124.0.0.2"
            },
            type: "ris_message"
        });

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
    new Consumer()
}
