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

export default class MonitorAS extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);
        this.thresholdMinPeers = params?.thresholdMinPeers ?? 3;
        this.skipPrefixMatch = !!params?.skipPrefixMatch;
        this.updateMonitoredResources();
    };

    updateMonitoredResources = () => {
        // nothing
    };

    filter = (message) => {
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {
        const matchedMessages = alerts.map(alert => alert.matchedMessage);
        const matchPerPrefix = {};
        const prefixesOut = [];

        for (let m of matchedMessages) { // Get the number of peers that triggered the alert for each prefix
            matchPerPrefix[m.prefix] = matchPerPrefix[m.prefix] || [];
            matchPerPrefix[m.prefix].push(m.peer);
        }

        for (let p in matchPerPrefix) { // Check if any of the prefixes went above the thresholdMinPeers
            const peers = [...new Set(matchPerPrefix[p])];
            if (peers.length >= this.thresholdMinPeers) {
                prefixesOut.push(p);
            }
        }

        if (prefixesOut.length > 1) {
            return `${matchedMessages[0].originAS} is announcing some prefixes which are not in the configured list of announced prefixes: ${prefixesOut}`
        } else if (prefixesOut.length === 1) {
            return `${matchedMessages[0].originAS} is announcing ${matchedMessages[0].prefix} but this prefix is not in the configured list of announced prefixes`;
        }

        return false;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {

            const messageOrigin = message.originAS;
            const messagePrefix = message.prefix;
            const matchedASRule = this.getMonitoredAsMatch(messageOrigin);

            if (matchedASRule) {

                const matchedPrefixRules = this.getMoreSpecificMatches(messagePrefix, true, false);

                if (this.skipPrefixMatch) {
                    const skipMatches = matchedPrefixRules.map(i => i.group).flat();
                    const goodMatches = [matchedASRule.group].flat();

                    for (let g of goodMatches) {
                        if (!skipMatches.includes(g)) {
                            this.publishAlert(messageOrigin.getId().toString() + "-" + messagePrefix,
                                messageOrigin.getId(),
                                {
                                    ...matchedASRule,
                                    group: [g]
                                },
                                message,
                                {});
                        }
                    }

                } else if (!matchedPrefixRules.length) {

                    this.publishAlert(messageOrigin.getId().toString() + "-" + messagePrefix,
                        messageOrigin.getId(),
                        matchedASRule,
                        message,
                        {});
                }
            }

            resolve(true);
        });

}