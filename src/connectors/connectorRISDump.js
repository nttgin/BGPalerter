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
import batchPromises from "batch-promises";
import brembo from "brembo";
import moment from "moment";
import {AS, Path} from "../model";

export default class ConnectorRISDump extends Connector {

    constructor(name, params, env) {
        super(name, params, env);
        this.withdrawNotVisible = this.params.withdrawNotVisible || false;
        this.storage = env.storage;
        this.lastRun = null;

        if (this.storage) {
            this.storage
                .get(`run-${this.name}`)
                .then(date => {
                    if (date && !isNaN(date)) {
                        this.lastRun = moment.unix(parseInt(date)).utc();
                    }
                })
                .catch(error => {
                    this.logger.log({
                        level: "error",
                        message: error
                    });
                });
        }
    };

    static transform = (message) => {
        return [message];
    };

    _shouldDownloadDump = () => {
        return !this.lastRun || this.lastRun.diff(moment(), "hours") > 2;
    };

    connect = () =>
        new Promise((resolve, reject) => {
            resolve(true);
        });

    _loadResource = (resource) => {
        const stop = moment().subtract(2, "hours").utc();
        const url = brembo.build("https://stat.ripe.net/data/bgplay/data.json", {
            params: {
                resource,
                rrcs: "0,11,13,14,15,16",
                "unix_timestamps": "TRUE",
                starttime: moment(stop).subtract(2, "minutes").unix(),
                stoptime: stop.unix()
            }
        });

        return this.axios({
            responseType: "json",
            url
        })
            .then(data => {
                if (data && data.data && data.data.data && data.data.data.initial_state) {
                    const dump = data.data.data.initial_state;
                    const sent = {};

                    for (let entry of dump) {
                        const path = new Path((entry.path || []).map(i => new AS(i)));
                        sent[entry.target_prefix] = true;
                        this._message({
                            type: "announcement",
                            prefix: entry.target_prefix,
                            peer: entry.source_id.split("-")[1],
                            path,
                            originAS: path.getLast(),
                            nextHop: null,
                            aggregator: null,
                            timestamp: stop.valueOf(),
                            communities: entry.community
                        });
                    }

                    if (this.withdrawNotVisible) { // This feature is not reachable for now
                        for (let entry of dump) {
                            if (!sent[entry.target_prefix]) {
                                this._message({
                                    type: "withdrawal",
                                    prefix: entry.target_prefix,
                                    peer: null,
                                    timestamp: stop.valueOf()
                                });
                            }
                        }
                    }
                }
            })
            .catch(error => {
                this.logger.log({
                    level: "error",
                    message: `Cannot download historic RIS data ${error}`
                });
            });
    };

    _subscribe = (input) => {
        if (this._shouldDownloadDump()) {
            const asns = input.getMonitoredASns().map(i => i.asn);
            const prefixes = input.getMonitoredPrefixes().filter(i => !asns.includes(i.asn)).map(i => i.prefix);
            const dumps = [...asns, ...prefixes];

            if (dumps.length) {
                this.storage
                    .set(`run-${this.name}`, moment.utc().unix())
                    .catch(error => {
                        this.logger.log({
                            level: "error",
                            message: error
                        });
                    });

                return batchPromises(1, dumps, this._loadResource);
            }
        }
    };

    subscribe = (input) => {
        this._subscribe(input);

        input.onChange(() => {
            if (this._timeoutFileChange) {
                clearTimeout(this._timeoutFileChange);
            }
            this._timeoutFileChange = setTimeout(() => {
                this._subscribe(input);
            }, 2000);
        });

        return Promise.resolve();
    };
};
