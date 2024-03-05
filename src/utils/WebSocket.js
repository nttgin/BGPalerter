import _ws from "ws";
import PubSub from "../utils/pubSub";
import brembo from "brembo";
import { v4 as uuidv4 } from 'uuid';
import nodeCleanup from "node-cleanup";

export default class WebSocket {
    constructor(host, options) {

        this.pubsub = new PubSub();
        this.host = host;
        this.options = options;
        this.ws = null;
        this.alive = false;
        this.pingInterval = options.pingIntervalSeconds ? options.pingIntervalSeconds * 1000 : 40000;
        this.reconnectSeconds = options.reconnectSeconds ? options.reconnectSeconds * 1000 : 30000;
        this.connectionDelay = 8000;
        this.openConnectionTimeoutSeconds = 40000;
        this.lastPingReceived = null;

        nodeCleanup(() => {
            if (this.ws) {
                this.pubsub.publish("close", "process termination");
                this.disconnect();
            }
        });
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
            this._ping();
            if (this.lastPingReceived + (this.pingInterval * nPings) < new Date().getTime()) {
                // this._publishError(`The WebSocket client didn't receive ${nPings} pings.`)
                // this.disconnect();
                // this.connect();
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
        this.connectionId = uuidv4();
        const url = brembo.build(this.host.split("?")[0], {
            params: {
                ...brembo.parse(this.host).params,
                connection: this.connectionId
            }
        });

        this.ws = new _ws(url, this.options);
        this.setOpenTimeout(true);

        this.ws.on('message', (data) => {
            this._pingReceived();
            this.pubsub.publish("message", data);
        });
        this.ws.on('close', data => {
            this.alive = false;
            this.setOpenTimeout(false);
            this.pubsub.publish("close", data);
        });
        this.ws.on('pong', this._pingReceived);
        this.ws.on('error', message => {
            this._publishError(message);
        });
        this.ws.on('open', () => {
            this.alive = true;
            this.setOpenTimeout(false);
            this.pubsub.publish("open", { connection: this.connectionId });
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

    _publishError = (message) => {
        this.pubsub.publish("error", { type: "error", message, connection: this.connectionId });
    };

    setOpenTimeout = (setting) => {
        if (this.openConnectionTimeout) {
            clearTimeout(this.openConnectionTimeout);
        }
        if (setting) {
            this.openConnectionTimeout = setTimeout(() => {
                this._publishError("connection timed out");
                if (this.ws) {
                    this.disconnect();
                    this.connect();
                }
            }, this.openConnectionTimeoutSeconds);
        }
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