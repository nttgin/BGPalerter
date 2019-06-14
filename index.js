// import os from "os";
import config from "./config";
import cluster from "cluster";
import WebSocket from "ws";
import Consumer from "./consumer";


if (cluster.isMaster) {

    let bufferSize = config.bufferSize;
    const worker = cluster.fork();
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




} else {
    new Consumer()
}
