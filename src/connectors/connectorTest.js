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

// IMPORTANT: This Connector is used by the automated tests. Please, ignore!

import Connector from "./connector";
import {AS, Path} from "../model";
import ipUtils from "ip-sub";

export default class ConnectorTest extends Connector {

    constructor(name, params, env) {
        super(name, params, env);
        this.pubSub.subscribe("test-type", (message, type) => {
            clearInterval(this.timer);
            this.subscribe({type: message});
        });

        this.subscribe({type: params.testType});
    }

    static transform = (message) => {
        if (message.type === "ris_message") {
            try {
                message = message.data;
                const components = [];
                const announcements = message["announcements"] || [];
                const aggregator = message["aggregator"] || null;
                const withdrawals = message["withdrawals"] || [];
                const peer = message["peer"];
                const communities = message["community"] || [];
                const timestamp = new Date().getTime();
                let path, originAS;

                if (message["path"] && message["path"].length) {
                    path = new Path(message["path"].map(i => new AS(i)));
                    originAS = path.getLast();
                } else {
                    path = new Path([]);
                    originAS = null;
                }

                if (originAS && path.length()) {
                    for (let announcement of announcements) {
                        const nextHop = announcement["next_hop"];

                        if (ipUtils.isValidIP(nextHop)) {
                            const prefixes = (announcement["prefixes"] || [])
                                .filter(prefix => ipUtils.isValidPrefix(prefix));

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
                                });
                            }
                        }
                    }
                }

                for (let prefix of withdrawals) {
                    components.push({
                        type: "withdrawal",
                        prefix,
                        peer,
                        timestamp
                    });
                }

                return components;
            } catch (error) {
                throw new Error(`Error during transform (${this.name}): ` + error.message);
            }
        } else if (message.type === "ris_error") {
            throw new Error("Error from RIS: " + message.data.message);
        }
    };

    connect = () => {
        this._connect("Test connector connected");
        return Promise.resolve();
    };

    _fadeOffTest = (fade) => {
        const updates = [
            {
                data: {
                    withdrawals: ["165.24.225.0/24"],
                    peer: "124.0.0.1"
                },
                type: "ris_message"
            },
            {
                data: {
                    withdrawals: ["165.24.225.0/24"],
                    peer: "124.0.0.2"
                },
                type: "ris_message"
            },
            {
                data: {
                    withdrawals: ["165.24.225.0/24"],
                    peer: "124.0.0.3"
                },
                type: "ris_message"
            },
            {
                data: {
                    withdrawals: ["165.24.225.0/24"],
                    peer: "124.0.0.4"
                },
                type: "ris_message"
            }
        ];

        this._message(updates[0]);
        this._message(updates[1]);
        this._message(updates[2]);

        setTimeout(() => {
            this._message(updates[3]);
        }, (this.config.fadeOffSeconds + ((fade) ? -4 : 4)) * 1000); // depending on "fade" it goes in our out of the fading period
    };

    subscribe = (params) => {
        const type = params.type || this.params.testType;

        let updates;

        switch (type) {
            case "fade-off":
                return this._fadeOffTest(false);

            case "fade-in":
                return this._fadeOffTest(true);

            case "hijack":
                updates = [
                    {
                        data: {
                            announcements: [{ // RPKI valid announcement, no alert should be triggered (issue #358)
                                prefixes: ["193.0.0.0/21"],
                                next_hop: "1.2.3.4"
                            }],
                            peer: "1.2.3.5",
                            path: [1, 2, 3, 3333]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["175.254.205.0/25", "170.254.205.0/25"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 4321]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["165.254.255.0/25"],
                                next_hop: "124.0.0.2"
                            }],
                            peer: "124.0.0.2",
                            path: [1, 2, 3, [4, 15562]]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a00:5884:ffff::/48"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 208585]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a00:5884::/32"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, [204092, 45]]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a00:5884::/32"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, [15563]]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a00:5884::/32"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 204092]
                        },
                        type: "ris_message"
                    }
                ];
                break;

            case "newprefix":
                updates = [
                    {
                        data: {
                            announcements: [{
                                prefixes: ["165.254.255.0/25"],
                                next_hop: "124.0.0.2"
                            }],
                            peer: "124.0.0.2",
                            path: [1, 2, 3, 15562]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a00:5884::/32"],
                                next_hop: "124.0.0.2"
                            }],
                            peer: "124.0.0.2",
                            path: [1, 2, 3, [45]]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a00:5884:ffff::/48"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 204092]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a0e:f40::/32"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 204092]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a0e:240::/32"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 1345]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["175.254.205.0/25", "170.254.205.0/25"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 1234]
                        },
                        type: "ris_message"
                    }
                ];
                break;

            case "visibility":
                updates = [
                    {
                        data: {
                            withdrawals: ["165.254.225.0/24"],
                            peer: "124.0.0.2"
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            withdrawals: ["2a00:5884::/32"],
                            peer: "124.0.0.2"
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            withdrawals: ["2a00:5884:ffff::/48"],
                            peer: "124.0.0.2"
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            withdrawals: ["2a0e:f40::/32"],
                            peer: "124.0.0.2"
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            withdrawals: ["2001:db8:123::/48"],
                            peer: "124.0.0.2"
                        },
                        type: "ris_message"
                    }
                ];
                break;

            case "path":
                updates = [
                    {
                        data: {
                            announcements: [{
                                prefixes: ["94.5.4.3/22", "98.5.4.3/22", "99.5.4.3/22"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 4321, 5060, 2914]
                        },
                        type: "ris_message"
                    }
                ];
                break;

            case "misconfiguration":
                updates = [
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2.2.2.3/22"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.4",
                            path: [1, 2, 3, 4321, 5060, 2914]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2001:db8:123::/48", "2001:db8:123::/49"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.10",
                            path: [1, 2, 3, 4321, 65000]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2001:db8:123::/48", "2001:db8:123::/49"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.9",
                            path: [1, 2, 3, 4321, 65000]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2001:db8:123::/48", "2001:db8:123::/49"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 4321, 65000]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2.2.2.5/22", "2001:db9:123::/49"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 4321, 5060, 2914]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2.2.2.3/22", "2001:db9:123::/49"],
                                next_hop: "124.0.0.5"
                            }],
                            peer: "124.0.0.6",
                            path: [1, 2, 3, 4321, 5060, 2914]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["2a0e:240::/32"],
                                next_hop: "124.0.0.5"
                            }],
                            peer: "124.0.0.6",
                            path: [1, 2, 3, 4321, 5060, 2914]
                        },
                        type: "ris_message"
                    }
                ];
                break;

            case "rpki":
                updates = [
                    {
                        data: {
                            announcements: [{
                                prefixes: ["82.112.100.0/24"], // Valid
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.4",
                            path: [1, 2, 3, 4321, 2914]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["8.8.8.8/22"], // Not covered
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.4",
                            path: [1, 2, 3, 4321, 5060, 2914]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["103.21.244.0/24"], // Invalid
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.4",
                            path: [1, 2, 3, 4321, 13335]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["175.254.205.0/25", "170.254.205.0/25"],
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [1, 2, 3, 4321]
                        },
                        type: "ris_message"
                    }
                ];
                break;

            case "path-neighbors":
                updates = [
                    {
                        data: {
                            announcements: [{
                                prefixes: ["9.5.4.3/22"], // Path not ok but prefix not monitored
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [98, 99, 100, 101, 106]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["99.5.4.3/22"], // Monitored but path ok
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [98, 99, 100, 101, 104]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["99.5.4.3/22"], // Monitored, path with wrong downstream
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [98, 99, 100, 101, 106]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["99.5.4.3/22"], // Monitored, path with wrong upstream
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [98, 99, 30, 101, 104]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["99.5.4.3/22"], // Monitored, path with empty downstream ok
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [98, 99, 80]
                        },
                        type: "ris_message"
                    },
                    {
                        data: {
                            announcements: [{
                                prefixes: ["99.5.4.3/22"], // Monitored, path with empty downstream not ok
                                next_hop: "124.0.0.3"
                            }],
                            peer: "124.0.0.3",
                            path: [98, 99, 80, 100]
                        },
                        type: "ris_message"
                    }
                ];
                break;

            default:
                return;
        }

        this.timer = setInterval(() => {
            updates.forEach(update => {
                this._message(update);
                if (type === "visibility") {
                    let peer = update.data.peer.split(".");
                    peer[3] = Math.min(parseInt(peer[3]) + 1, 254);
                    update.data.peer = peer.join(".");
                }
            });
        }, 1000);

        return Promise.resolve();
    };
}