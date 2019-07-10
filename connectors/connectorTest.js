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

import Connector from "./connector";

export default class ConnectorTest extends Connector{

    static isTest = true;

    constructor(name, params, env) {
        super(name, params, env);
        console.log("Test connector running");
        this.pubSub.subscribe("test-type", (type, message) => {
            clearInterval(this.timer);
            this.subscribe({type: message});
            console.log("switching to", message);
        });
    }

    connect = () =>
        new Promise((resolve, reject) => {
            resolve(true);
        });

    subscribe = (params) =>
        new Promise((resolve, reject) => {
            resolve(true);

            const type = params.type || this.params.testType;

            let update;

            switch (type) {
                case "hijack":
                    update = {
                        data: {
                            announcements: [{
                                prefixes: ["180.50.120.0/22"],
                                next_hop: "124.0.0.2"
                            }],
                            peer: "124.0.0.2",
                            path: "1,2,3,4".split(",")
                        },
                        type: "ris_message"
                    };
                    break;

                case "newprefix":
                    update = {
                        data: {
                            announcements: [{
                                prefixes: ["180.50.120.0/22"],
                                next_hop: "124.0.0.2"
                            }],
                            peer: "124.0.0.2",
                            path: "1,2,3,4713".split(",")
                        },
                        type: "ris_message"
                    };
                    break;

                default:
                    update = {
                        data: {
                            withdrawals: ["124.40.52.128/26"],
                            peer: "124.0.0.2"
                        },
                        type: "ris_message"
                    };
            }

            this.timer = setInterval(() => {
                this.message(JSON.stringify(update));
                if (type === 'withdrawal') {
                    let peer = update.data.peer.split('.');
                    peer[3] = Math.min(parseInt(peer[3]) + 1, 254);
                    update.data.peer = peer.join(".");
                }
            }, 1000);

        });

    static transform = (message) => {
        if (message.type === 'ris_message') {
            message = message.data;
            const components = [];
            const announcements = message["announcements"] || [];
            const withdrawals = message["withdrawals"] || [];
            const peer = message["peer"];
            const path = message["path"];

            for (let announcement of announcements){
                const nextHop = announcement["next_hop"];
                const prefixes = announcement["prefixes"] || [];

                for (let prefix of prefixes){
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