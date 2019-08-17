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

export default class ConnectorRIS extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
        this.ws = null;
        this.subscription = null;
        this.pingTimer = null;
    }

    connect = () =>
        new Promise((resolve, reject) => {
            try {
                delete this.pingTimer;
                this.ws = new WebSocket(this.params.url);

                this.pingTimer = setInterval(() => {
                    this.ws.ping(() => {})
                }, 5000);

                this.ws.on('message', this.message);
                this.ws.on('close', this.close);
                this.ws.on('error', this.error);
                this.ws.on('open', () => {
                    resolve(true);
                    this.connected(this.name + ' connector connected');
                });

            } catch(error) {
                this.error(error);
                resolve(false);
            }
        });


    close = (error) => {
        this.error(error);
        clearInterval(this.pingTimer);
        setTimeout(() => this.subscribe(this.subscription), 5000);
    };

    _subscribeToAll = (input) => {
        console.log("Subscribing to everything");
        this.ws.send(JSON.stringify({
            type: "ris_subscribe",
            data: this.params.subscription
        }));

    };

    _subscribeToPrefixes = (input) => {
        const monitoredPrefixes = input.getMonitoredPrefixes().map(item => item.prefix);
        const params = JSON.parse(JSON.stringify(this.params.subscription));
        for (let prefix of monitoredPrefixes){
            params.prefix = prefix;
            console.log("Subscribing to:", prefix);
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
                return (this.params.carefulSubscription) ?
                    this._subscribeToPrefixes(input) :
                    this._subscribeToAll(input);

                resolve(true);
            } catch(error) {
                this.error(error);
                resolve(false);
            }
        });

    static transform = (message) => {
        if (message.type === 'ris_message') {
            message = message.data;
            const components = [];
            const announcements = message["announcements"] || [];
            const withdrawals = message["withdrawals"] || [];
            const peer = message["peer"];
            const path = message["path"];

            for (let announcement of announcements) {
                const nextHop = announcement["next_hop"];
                const prefixes = announcement["prefixes"] || [];

                for (let prefix of prefixes) {
                    components.push({
                        type: "announcement",
                        prefix,
                        peer,
                        path,
                        originAs: path[path.length - 1],
                        nextHop
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
        }
    }
};
