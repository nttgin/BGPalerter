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
import ipUtils from "ip-sub";

export default class MonitorVisibility extends Monitor {

    constructor(name, channel, params, env, input) {
        super(name, channel, params, env, input);
        this.thresholdMinPeers = params?.thresholdMinPeers ?? 40;
        if (params.threshold) {
            throw new Error("The parameter threshold has been replaced by thresholdMinPeers and it will be soon deprecated.")
        }
        this.updateMonitoredResources();
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredPrefixes();
    };

    filter = (message) => {
        return message.type === "withdrawal";
    };

    squashAlerts = (alerts) => {
        const peers = this.getPeers(alerts);

        if (peers >= this.thresholdMinPeers) {
            return (peers === 1) ?
                `The prefix ${alerts[0].matchedMessage.prefix} (${alerts[0].matchedRule.description}) it's no longer visible (withdrawn) from the peer ${alerts[0].matchedMessage.peer}` :
                `The prefix ${alerts[0].matchedMessage.prefix} (${alerts[0].matchedRule.description}) has been withdrawn. It is no longer visible from ${peers} peers`;
        } else {
            return false;
        }
    };

    monitor = (message) => {
        const messagePrefix = message.prefix;
        const matchedRules = this.getMoreSpecificMatches(messagePrefix, false);

        for (let matchedRule of matchedRules) {
            if (!matchedRule.ignore && ipUtils._isEqualPrefix(matchedRule.prefix, messagePrefix)) {

                let key = matchedRule.prefix;

                this.publishAlert(key,
                    matchedRule.asn.getId(),
                    matchedRule,
                    message,
                    {});
            }
        }

        return Promise.resolve(true);
    };
}