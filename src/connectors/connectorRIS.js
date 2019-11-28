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

export default class ConnectorRIS extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
        this.ws = null;
        this.subscription = null;
        this.pingTimer = null;

        this.url = brembo.build(this.params.url, {
            path: [],
            params: {
                client: env.clientId
            }
        });

    }

    connect = () =>
        new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.pingTimer = setInterval(() => {
                    try {
                        this.ws.ping(() => {});
                    } catch (e) {
                        // Nothing to do here
                    }
                }, 5000);

                this.ws.on('message', this._message);
                this.ws.on('close', this._close);
                this.ws.on('error', this._error);
                this.ws.on('open', () => {
                    resolve(true);
                    this._connect(this.name + ' connector connected');
                });

            } catch(error) {
                this._error(error);
                resolve(false);
            }
        });

    _close = (error) => {
        this._disconnect(error);
        clearInterval(this.pingTimer);

        // Reconnect
        setTimeout(() => {
            try {
                this.ws.terminate();
            } catch(e) {
                // Nothing to do here
            }
            this.connect()
                .then(() => this.subscribe(this.subscription));
        }, 5000);
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
        for (let p of monitoredPrefixes){
            if (p.path && p.path.match){
                const regex = this._optimizedPathMatch(p.path.match);
                if (regex) {
                    params.path = regex;
                }
            }
            console.log("Monitoring", p.prefix);
            params.prefix = p.prefix;

            this.ws.send(JSON.stringify({
                type: "ris_subscribe",
                data: params
            }));
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
                            aggregator
                        })
                    }
                }

                for (let prefix of withdrawals) {
                    components.push({
                        type: "withdrawal",
                        prefix,
                        peer
                    })
                }

                return components;
            } catch (error) {
                throw new Error(`Error during tranform (${this.name}): ` + error.message);
            }
        } else if (message.type === 'ris_error') {
            console.log(message);
            throw new Error("Error from RIS: " + message.data.message);
        }

    }
};
