/*
 * 	BSD 3-Clause License
 *
 * Copyright (c) 2019, NTT Ltd.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import WebSocket from "ws";
import Connector from "./connector";
import { AS, Path } from "../model";
import brembo from "brembo";
import ipUtils from "ip-sub";

export default class ConnectorRIS extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
        this.ws = null;
        this.subscription = null;
        this.pingInterval = 5000;
        this._defaultReconnectTimeout = 10000;
        this.reconnectTimeout = this._defaultReconnectTimeout;
        this.agent = env.agent;

        setInterval(this._ping, this.pingInterval);

        this.url = brembo.build(this.params.url, {
            path: [],
            params: {
                client: env.clientId
            }
        });

    };

    _ping = () => {
        if (this.ws) {
            try {
                this.ws.ping();
            } catch (e) {
                // Nothing to do here
            }
        }
    };

    _pingReceived = () => {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
        }
        this.closeTimeout = setTimeout(this._close, this.pingInterval * 3);
    };

    _openConnect = (resolve) => {
        resolve(true);
        this.reconnectTimeout = this._defaultReconnectTimeout;
        this._connect(this.name + ' connector connected');
    };

    _messageToJson = (message) => {
        this._message(JSON.parse(message));
    };

    connect = () =>
        new Promise((resolve, reject) => {
            try {
                const wsOptions = {
                    perMessageDeflate: this.params.perMessageDeflate
                };
                if (!this.params.noProxy && this.agent) {
                    wsOptions.agent = this.agent;
                }
                this.ws = new WebSocket(this.url, wsOptions);

                this.ws.on('message', this._messageToJson);
                this.ws.on('close', (error) => {

                    if (this.connected) {
                        this._close("RIPE RIS disconnected (error: " + error + "). Read more at https://github.com/nttgin/BGPalerter/blob/master/docs/ris-disconnections.md");
                    } else {
                        this._close("It was not possible to establish a connection with RIPE RIS");
                        reject();
                    }
                });
                this.ws.on('error', this._error);
                this.ws.on('open', this._openConnect.bind(null, resolve));
                this.ws.on('ping', this._pingReceived);
            } catch(error) {
                this._error(error);
                reject(error);
            }
        });

    _reconnect = () => {
        this.connect()
            .then(() => {
                if (this.subscription) {
                    this.subscribe(this.subscription);
                }
            })
            .catch(error => {
                if (error) {
                    this.logger.log({
                        level: 'error',
                        message: error
                    });
                }
            });
    };

    _getTimeoutReconnect = () => {
        this.reconnectTimeout += (this.reconnectTimeout / 2);
        return Math.min(120000, this.reconnectTimeout);
    };

    _close = (error) => {
        this._disconnect(error);
        try {
            this.ws.terminate();
            this.ws.removeAllListeners();
        } catch(e) {
            // Nothing to do here
        }
        // Reconnect
        setTimeout(this._reconnect, this._getTimeoutReconnect());
    };

    _subscribeToAll = (input) => {
        this.ws.send(JSON.stringify({
            type: "ris_subscribe",
            data: this.params.subscription
        }));

    };

    _optimizedPathMatch = (regex) => {

        if (regex) {
            regex = (regex.slice(0,2) === ".*") ? regex.slice(2) : regex;
            regex = (regex.slice(-2) === ".*") ? regex.slice(0,-2) : regex;
            const regexTests = [
                "^[\\^]*\\d+[\\$]*$",
                "^[\\^]*[\\d+,]+\\d+[\\$]*$",
                "^[\\^]*\\[[\\d+,]+\\d+\\][\\$]*$"
            ];

            for (let r of regexTests) {
                if (new RegExp(r).test(regex)) {
                    return regex;
                }
            }
        }

        return null;
    };

    _subscribeToPrefixes = (input) => {
        const monitoredPrefixes = input.getMonitoredLessSpecifics();

        const params = JSON.parse(JSON.stringify(this.params.subscription));

        if (monitoredPrefixes
            .filter(
                i => (ipUtils._isEqualPrefix(i.prefix, '0:0:0:0:0:0:0:0/0') || ipUtils._isEqualPrefix(i.prefix,'0.0.0.0/0'))
            ).length === 2) {

            delete params.prefix;

            console.log("Monitoring everything");
            this.ws.send(JSON.stringify({
                type: "ris_subscribe",
                data: params
            }));

        } else {

            for (let p of monitoredPrefixes) {

                console.log("Monitoring", p.prefix);
                params.prefix = p.prefix;

                this.ws.send(JSON.stringify({
                    type: "ris_subscribe",
                    data: params
                }));
            }
        }
    };

    _subscribeToASns = (input) => {
        const monitoredASns = input.getMonitoredASns().map(i => i.asn);

        const params = JSON.parse(JSON.stringify(this.params.subscription));
        for (let asn of monitoredASns){

            console.log("Monitoring AS", asn.getValue());
            params.path = '' + asn.getValue() + '$';

            this.ws.send(JSON.stringify({
                type: "ris_subscribe",
                data: params
            }));
        }
    };


    subscribe = (input) =>
        new Promise((resolve, reject) => {
            this.subscription = input;
            try {
                input.onChange(() => {
                    this._close();
                });

                if (this.params.carefulSubscription) {
                    this._subscribeToPrefixes(input);
                    this._subscribeToASns(input);
                } else {
                    this._subscribeToAll(input);
                }

                resolve(true);
            } catch(error) {
                this._error(error);
                resolve(false);
            }
        });

    static transform = (message) => {
        if (message.type === 'ris_message') {
            try {
                message = message.data;
                const components = [];
                const announcements = message["announcements"] || [];
                const aggregator = message["aggregator"] || null;
                const withdrawals = message["withdrawals"] || [];
                const peer = message["peer"];
                const communities = message["community"] || [];
                const timestamp = message["timestamp"] * 1000;
                let path, originAS;
                if (message["path"] && message["path"].length) {
                    path = new Path(message["path"].map(i => new AS(i)));
                    originAS = path.getLast();
                } else {
                    path = new Path([]);
                    originAS = null;
                }

                for (let announcement of announcements) {
                    const nextHop = announcement["next_hop"];
                    const prefixes = announcement["prefixes"] || [];

                    for (let prefix of prefixes) {

                        components.push({
                            type: "announcement",
                            prefix,
                            peer,
                            path,
                            originAS,
                            nextHop,
                            aggregator,
                            timestamp,
                            communities
                        })
                    }
                }

                for (let prefix of withdrawals) {
                    components.push({
                        type: "withdrawal",
                        prefix,
                        peer,
                        timestamp
                    })
                }

                return components;
            } catch (error) {
                throw new Error(`Error during tranform (${this.name}): ` + error.message);
            }
        } else if (message.type === 'ris_error') {
            throw new Error("Error from RIS: " + message.data.message);
        }

    }
};
