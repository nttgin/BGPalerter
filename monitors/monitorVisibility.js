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
import ipUtils from "../ipUtils";

export default class MonitorVisibility extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.threshold = (params.threshold != null) ? params.threshold : 10;
        this.updateMonitoredPrefixes();
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredPrefixes();
        this.monitoredSimpleArray = this.monitored.map(item => item.prefix);
    };

    filter = (message) => {
        // Based on exact match only
        return message.type === 'withdrawal'
            && this.monitoredSimpleArray.includes(message.prefix);
    };

    squashAlerts = (alerts) => {
        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;

        if (peers >= this.threshold) {
            return (peers === 1) ?
                `The prefix ${alerts[0].matchedMessage.prefix} (${alerts[0].matchedRule.description}) it's no longer visible (withdrawn) from the peer ${alerts[0].matchedMessage.peer}.` :
                `The prefix ${alerts[0].matchedMessage.prefix} (${alerts[0].matchedRule.description}) has been withdrawn. It is no longer visible from ${peers} peers.`;
        } else {
            return false;
        }
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {

            const messagePrefix = message.prefix;

            let matches = this.monitored.filter(item => {
                return item.prefix == messagePrefix;
            });
            if (matches.length > 1) {
                matches = [matches.sort((a, b) => ipUtils.sortByPrefixLength(a.prefix, b.prefix)).pop()];
            }

            if (matches.length !== 0) {
                const match = matches[0];
                let key = match.prefix;

                this.publishAlert(key,
                    `The prefix ${match.prefix} has been withdrawn.`,
                    match.asn,
                    matches[0],
                    message,
                    {});
            }

            resolve(true);
        });

}