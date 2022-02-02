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

import WebSocket from "../utils/WebSocket";
import Connector from "./connector";
import { AS, Path } from "../model";
import brembo from "brembo";
import ipUtils from "ip-sub";

const beacons = {
    v4: ["84.205.64.0/24", "84.205.65.0/24", "84.205.67.0/24", "84.205.68.0/24", "84.205.69.0/24",
        "84.205.70.0/24", "84.205.71.0/24", "84.205.74.0/24", "84.205.75.0/24", "84.205.76.0/24", "84.205.77.0/24",
        "84.205.78.0/24", "84.205.79.0/24", "84.205.73.0/24", "84.205.82.0/24", "93.175.149.0/24", "93.175.151.0/24",
        "93.175.153.0/24"],
    v6: ["2001:7FB:FE00::/48", "2001:7FB:FE01::/48", "2001:7FB:FE03::/48", "2001:7FB:FE04::/48",
        "2001:7FB:FE05::/48", "2001:7FB:FE06::/48", "2001:7FB:FE07::/48", "2001:7FB:FE0A::/48", "2001:7FB:FE0B::/48",
        "2001:7FB:FE0C::/48", "2001:7FB:FE0D::/48", "2001:7FB:FE0E::/48", "2001:7FB:FE0F::/48", "2001:7FB:FE10::/48",
        "2001:7FB:FE12::/48", "2001:7FB:FE13::/48", "2001:7FB:FE14::/48", "2001:7FB:FE15::/48", "2001:7FB:FE16::/48",
        "2001:7FB:FE17::/48", "2001:7FB:FE18::/48"]
};

const selectedBeacons = [
    ...beacons.v4.sort(() => .5 - Math.random()).slice(0, 3),
    ...beacons.v6.sort(() => .5 - Math.random()).slice(0, 3)
];

let filteredBeacons = selectedBeacons;

const acceptPrefix = (prefix, possibleRIS) => {
    return ipUtils.isValidPrefix(prefix) && (!possibleRIS || !filteredBeacons.some(p => ipUtils.isEqualPrefix(p, prefix)));
};

export default class ConnectorRIS extends Connector {

    constructor(name, params, env) {
        super(name, params, env);
        this.ws = null;
        this.environment = env.config.environment;
        this.subscription = null;
        this.agent = env.agent;
        this.subscribed = {};
        this.canaryBeacons = {};
        this.clientId = env.clientId;
        this.instanceId = env.instanceId;

        this.url = brembo.build(this.params.url, {
            params: {
                client_version: env.version,
                client: this.clientId,
                instance: this.instanceId
            }
        });
    };

    _shouldCanaryMonitoringStart = () => {
        return this.environment !== "research" && !this.params.disableCanary;
    };

    _openConnect = (resolve, data) => {
        resolve(true);
        this._connect(`${this.name} connector connected (instance:${this.instanceId} connection:${data.connection})`);
        if (this.subscription) {
            this.subscribe(this.subscription);
        }
    };

    _messageToJsonCanary = (message) => {
        this._checkCanary();
        message = JSON.parse(message);
        const path = (message.data || {}).path;
        if (path && path.length && path[path.length - 1] == 12654) { // Otherwise, don't alter the data
            message.data.possibleRIS = true;
        }
        this._message(message);
    };

    _messageToJson = (message) => {
        this._message(JSON.parse(message));
    };

    _appendListeners = (resolve, reject) => {
        if (this._shouldCanaryMonitoringStart()) {
            this.ws.on('message', this._messageToJsonCanary);
        } else {
            this.ws.on('message', this._messageToJson);
        }
        this.ws.on('close', (error) => {

            if (this.connected) {
                this._disconnect("RIPE RIS disconnected (error: " + error + "). Read more at https://github.com/nttgin/BGPalerter/blob/main/docs/ris-disconnections.md");
            } else {
                this._disconnect("It was not possible to establish a connection with RIPE RIS");
                reject();
            }
        });
        this.ws.on('error', error => {
            this._error(`${this.name} ${error.message} (instance:${this.instanceId} connection:${error.connection})`);
        });
        this.ws.on('open', data => this._openConnect(resolve, data));
    };

    connect = () =>
        new Promise((resolve, reject) => {
            try {
                if (this.ws) {
                    this.ws.disconnect();
                }
                const wsOptions = {
                    perMessageDeflate: this.params.perMessageDeflate
                };

                if (this.params.authorizationHeader){
                    wsOptions.headers = {
                        Authorization: this.params.authorizationHeader
                    }
                }

                if (!this.params.noProxy && this.agent) {
                    wsOptions.agent = this.agent;
                }

                this.ws = new WebSocket(this.url, wsOptions);
                this.ws.connect();
                this._appendListeners(resolve, reject);

            } catch(error) {
                this._error(error);
                reject(error);
            }
        });

    disconnect = () => {
        if (this.ws) {
            this._disconnect(`${this.name} disconnected`);
        }
    };

    _subscribeToAll = (input) => {
        return this.ws.send(JSON.stringify({
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

        if (monitoredPrefixes.filter(i => (ipUtils.isEqualPrefix(i.prefix, '0:0:0:0:0:0:0:0/0') || ipUtils.isEqualPrefix(i.prefix,'0.0.0.0/0'))).length === 2) {

            delete params.prefix;

            if (!this.subscribed["everything"]) {
                console.log("Monitoring everything");
                this.subscribed["everything"] = true;
            }

            filteredBeacons = []; // No beacons to filter

            return this.ws.send(JSON.stringify({
                type: "ris_subscribe",
                data: params
            }));

        } else {

            return Promise.all(monitoredPrefixes.map(p => {
                if (!this.subscribed[p.prefix]) {
                    console.log("Monitoring", p.prefix);
                    this.subscribed[p.prefix] = true;
                }

                params.prefix = p.prefix;

                filteredBeacons = filteredBeacons.filter(prefix => {
                    return !ipUtils.isEqualPrefix(p.prefix, prefix) && !ipUtils.isSubnet(p.prefix, prefix);
                });

                return this.ws.send(JSON.stringify({
                    type: "ris_subscribe",
                    data: params
                }));
            }));

        }
    };

    _subscribeToASns = (input) => {
        const monitoredASns = input.getMonitoredASns();
        const params = JSON.parse(JSON.stringify(this.params.subscription));

        return Promise.all(monitoredASns
            .map(asn => {
                const asnString = asn.asn.getValue();

                if (!this.subscribed[asnString]) {
                    console.log(`Monitoring AS${asnString}`);
                    this.subscribed[asnString] = true;
                }

                params.path = `${asnString}\$`;

                return this.ws.send(JSON.stringify({
                    type: "ris_subscribe",
                    data: params
                }));
            }));
    };

    _startCanary = () => {
        if (this.connected) {

            Promise.all(selectedBeacons
                .map(prefix => {
                    this.canaryBeacons[prefix] = true;
                    return this.ws.send(JSON.stringify({
                        type: "ris_subscribe",
                        data: {
                            moreSpecific: false,
                            lessSpecific: false,
                            prefix,
                            type: "UPDATE",
                            socketOptions: {
                                includeRaw: false,
                                acknowledge: false
                            }
                        }
                    }));
                }))
                .then(() => {
                    this._checkCanary();
                })
                .catch(() => {
                    this.logger.log({
                        level: 'error',
                        message: "Failed to subscribe to beacons"
                    });
                });
        }
    };

    _checkCanary = () => {
        clearTimeout(this._timerCheckCanary);
        if (!this.connected) {
            this.logger.log({
                level: 'error',
                message: "RIS connected again, the streaming session is working properly"
            });
        }
        this.connected = true;
        this._timerCheckCanary = setTimeout(() => {
            if (this.connected) {
                this.connected = false;
                this.logger.log({
                    level: 'error',
                    message: "RIS has been silent for too long, probably there is something wrong"
                });
            }
            if (this.ws) {
                this.ws.connect();
            }
        }, 3600 * 1000 * 4.5); // every 4.5 hours
    };

    _onInputChange = (input) => {
        this.connect()
            .then(() => this.subscribe(input))
            .then(() => {
                this.logger.log({
                    level: 'info',
                    message: "Prefix rules reloaded"
                });
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

    onInputChange = (input) => {
        input.onChange(() => {
            // An external process may write bits of the file and trigger the reload multiple times
            // the timer is reset on each change and it triggers the reload 2 sec after the process stops writing.
            if (this._timeoutFileChange) {
                clearTimeout(this._timeoutFileChange);
            }
            this._timeoutFileChange = setTimeout(() => {
                this._onInputChange(input);
            }, 5000);
        });
    };

    subscribe = (input) => {
        this.subscription = input;

        return (this.params.carefulSubscription
            ? Promise.all([this._subscribeToPrefixes(input), this._subscribeToASns(input)])
            : this._subscribeToAll(input))
            .then(() => {
                    if (this._shouldCanaryMonitoringStart()) {
                        this._startCanary();
                    }
                }
            )
            .then(() => {
                this.onInputChange(input);

                return true;
            })
            .catch(error => {
                this._error(error);

                return false;
            });
    }

    static transform = (message) => {
        if (message.type === 'ris_message') {
            try {
                message = message.data;
                const components = [];
                const announcements = message["announcements"] || [];
                const aggregator = message["aggregator"] || null;
                const possibleRIS = message["possibleRIS"] || false;
                const withdrawals = (message["withdrawals"] || []).filter(prefix => acceptPrefix(prefix, possibleRIS));
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

                if (originAS && path.length()) {
                    for (let announcement of announcements) {
                        const nextHop = announcement["next_hop"];

                        if (ipUtils.isValidIP(nextHop)) {
                            const prefixes = (announcement["prefixes"] || [])
                                .filter(prefix => acceptPrefix(prefix, possibleRIS));

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
        } else if (message.type === 'ris_error') {
            throw new Error("Error from RIS: " + message.data.message);
        }
    }
};
