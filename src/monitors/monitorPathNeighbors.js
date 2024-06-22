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

import Monitor from "./monitor";

export default class MonitorPathNeighbors extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);
        this.thresholdMinPeers = params?.thresholdMinPeers ?? 0;
        this.updateMonitoredResources();
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredASns();
    };

    filter = (message) => {
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {
        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;

        if (peers >= this.thresholdMinPeers) {
            const matchedRule = alerts[0].matchedRule;
            const extra = alerts[0].extra;
            const asnText = matchedRule.asn;

            return `A new ${extra.side} of ${asnText} has been detected: AS${extra.neighbor}`;
        }

        return false;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {
            const path = message.path;

            for (let monitoredAs of this.monitored) {
                if (monitoredAs.upstreams || monitoredAs.downstreams) {
                    const [left, _, right] = path.getNeighbors(monitoredAs.asn);

                    if (!!left || !!right) {
                        let match = false;
                        let side = null;
                        let id = null;

                        if (left) {
                            if (monitoredAs.upstreams === null) {
                                side = "upstream";
                                id = left.getId();
                                match = true;
                            } else if (monitoredAs.upstreams && !monitoredAs.upstreams.includes(left)) {
                                side = "upstream";
                                id = left.getId();
                                match = true;
                            }
                        }

                        if (right) {
                            if (monitoredAs.downstreams === null) {
                                side = "downstream";
                                id = right.getId();
                                match = true;
                            } else if (monitoredAs.downstreams && !monitoredAs.downstreams.includes(right)) {
                                side = "downstream";
                                id = right.getId();
                                match = true;
                            }
                        }


                        if (match) {
                            const monitoredId = monitoredAs.asn.getId();

                            if (monitoredId !== id) { // Skip prepending
                                this.publishAlert([monitoredId, id].join("-"),
                                    monitoredId,
                                    monitoredAs,
                                    message,
                                    {side, neighbor: id});
                            }
                        }
                    }
                }
            }

            resolve(true);
        });

}