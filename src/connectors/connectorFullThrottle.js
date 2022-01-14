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


// IMPORTANT: This Connector is just for stress tests during development. Please, ignore!

import Connector from "./connector";
import {AS, Path} from "../model";

export default class ConnectorFullThrottle extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
        this.updates = [
            {
                data: {
                    announcements: [{
                        prefixes: ["175.254.205.0/25", "170.254.205.0/25", "2001:db8:123::/48"],
                        next_hop: "198.51.100.3"
                    }],
                    peer: "198.51.100.3",
                    path: [1, 2, 3, 65000]
                },
                type: "ris_message"
            },
            {
                data: {
                    announcements: [{
                        prefixes: ["165.254.255.0/25"],
                        next_hop: "198.51.100.2"
                    }],
                    peer: "198.51.100.2",
                    path: [1, 2, 3, [4, 15562]]
                },
                type: "ris_message"
            },
            {
                data: {
                    announcements: [{
                        prefixes: ["2a00:5884:ffff::/48"],
                        next_hop: "198.51.100.3"
                    }],
                    peer: "198.51.100.3",
                    path: [1, 2, 3, 208585]
                },
                type: "ris_message"
            },
            {
                data: {
                    announcements: [{
                        prefixes: ["2a00:5884::/32"],
                        next_hop: "198.51.100.3"
                    }],
                    peer: "198.51.100.3",
                    path: [1, 2, 3, [204092, 45]]
                },
                type: "ris_message"
            },
            {
                data: {
                    announcements: [{
                        prefixes: ["2a00:5884::/32"],
                        next_hop: "198.51.100.3"
                    }],
                    peer: "198.51.100.3",
                    path: [1, 2, 3, [15563]]
                },
                type: "ris_message"
            },
            {
                data: {
                    announcements: [{
                        prefixes: ["2a00:5884::/32"],
                        next_hop: "198.51.100.3"
                    }],
                    peer: "198.51.100.3",
                    path: [1, 2, 3, 204092]
                },
                type: "ris_message"
            }
        ];
    }

    connect = () =>
        new Promise((resolve, reject) => {
            resolve(true);
        });

    subscribe = (params) =>
        new Promise((resolve, reject) => {
            resolve(true);
            this._startStream();
        });

    _startStream = () => {
        setInterval(() => { // just create a huge amount of useless messages
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
            this.updates.forEach(this._message);
        }, 2);
    };

    static transform = (message) => {
        if (message.type === 'ris_message') {
            message = message.data;
            const components = [];
            const announcements = message["announcements"] || [];
            const withdrawals = message["withdrawals"] || [];
            const aggregator = message["aggregator"] || null;
            const peer = message["peer"];

            for (let announcement of announcements){
                const nextHop = announcement["next_hop"];
                const prefixes = announcement["prefixes"] || [];
                let path = new Path(message["path"].map(i => new AS(i)));
                let originAS = path.getLast();

                for (let prefix of prefixes){
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

            for (let prefix of withdrawals){
                components.push({
                    type: "withdrawal",
                    prefix,
                    peer
                })
            }

            return components;
        }
    };
}
