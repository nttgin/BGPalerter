import _ws from "ws";
import PubSub from "../utils/pubSub";

export default class WebSocket {
    constructor(host, options) {

        this.pubsub = new PubSub();
        this.host = host;
        this.options = options;
        this.ws = null;
        this.alive = false;
        this.pingInterval = options.pingIntervalSeconds ? options.pingIntervalSeconds * 1000 : 40000;
        this.reconnectSeconds = options.reconnectSeconds ? options.reconnectSeconds * 1000 : 30000;
        this.connectionDelay = 5000;
        this.lastPingReceived = null;
    }

    _ping = () => {
        if (this.ws) {
            try {
                this.ws.ping();
            } catch (e) {
                // Nothing to do
            }
        }
    };

    _pingReceived = () => {
        this.lastPingReceived = new Date().getTime();
    };

    _pingCheck = () => {
        const nPings = 6;
        if (this.ws) {
            if (this.lastPingReceived + (this.pingInterval * nPings) < new Date().getTime()) {
                this.pubsub.publish("error", `The WebSocket client didn't receive ${nPings} pings. Disconnecting.`);
                this.disconnect();
                this.connect();
            } else {
                this._ping();
            }
        }
    };

    _startPing = () => {
        if (this.pingIntervalTimer) {
            clearInterval(this.pingIntervalTimer);
        }
        this._pingReceived(); // Set initial ping timestamp
        this.pingIntervalTimer = setInterval(() => {
            this._pingCheck();
        }, this.pingInterval);
    };

    _connect = () => {
        this.ws = new _ws(this.host, this.options);

        this.ws.on('message', (data) => {
            this.pubsub.publish("message", data);
        });
        this.ws.on('close', (data) => {
            this.alive = false;
            this.pubsub.publish("close", data);
        });
        this.ws.on('pong', this._pingReceived);
        this.ws.on('error', (data) => {
            this.pubsub.publish("error", data);
        });
        this.ws.on('open', (data) => {
            this.alive = true;
            this.pubsub.publish("open", data);
        });

        this._startPing();
    };

    send = (data) => {
        return new Promise((resolve, reject) => {
            try {
                this.ws.send(data);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };

    connect = () => {
        if (this.ws) {
            this.disconnect();
        }

        if (this.connectTimeout) {
            clearTimeout(this.connectTimeout);
        }
        this.connectTimeout = setTimeout(this._connect, this.connectionDelay);

        this.connectionDelay = this.reconnectSeconds;
    };

    disconnect = () => {
        try {
            this.ws.removeAllListeners("message");
            this.ws.removeAllListeners("close");
            this.ws.removeAllListeners("error");
            this.ws.removeAllListeners("open");
            this.ws.removeAllListeners("pong");
            this.ws.terminate();
            this.ws = null;
            this.alive = false;
            if (this.pingIntervalTimer) {
                clearInterval(this.pingIntervalTimer);
            }
        } catch (e) {
            // Nobody cares
        }
    };


    on = (event, callback) => this.pubsub.subscribe(event, callback);
}