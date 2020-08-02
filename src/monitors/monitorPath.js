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

export default class MonitorPath extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.thresholdMinPeers = (params && params.thresholdMinPeers != null) ? params.thresholdMinPeers : 1;
        this.updateMonitoredResources();
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredPrefixes();
    };

    filter = (message) => {
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {
        alerts = alerts.filter(i => i.matchedRule && i.matchedRule.path);
        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;

        if (peers >= this.thresholdMinPeers) {
            const lengthViolation = (alerts.some(i => i.extra.lengthViolation)) ? "(including length violation) " : "";
            return `Matched ${alerts[0].matchedRule.path.matchDescription} on prefix ${alerts[0].matchedMessage.prefix} ${lengthViolation}${alerts.length} times`;
        }

        return false;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {

            const messagePrefix = message.prefix;
            const matchedRule = this.getMoreSpecificMatch(messagePrefix, false);

            if (matchedRule && !matchedRule.ignore && matchedRule.path) {
                const pathString = message.path.getValues().join(",");

                let expMatch = true;
                let expNotMatch = true;
                let correctLength = true;

                if (matchedRule.path.match) {
                    expMatch = (new RegExp(matchedRule.path.match)).test(pathString);
                    if (!expMatch) {
                        resolve(true);
                        return;
                    }
                }

                if (matchedRule.path.notMatch){
                    expNotMatch = !(new RegExp(matchedRule.path.notMatch)).test(pathString);
                    if (!expNotMatch) {
                        resolve(true);
                        return;
                    }
                }

                if (matchedRule.path.maxLength && message.path.getValues().length > matchedRule.path.maxLength) {
                    correctLength = false;
                }

                if (matchedRule.path.minLength && message.path.getValues().length < matchedRule.path.minLength) {
                    correctLength = false;
                }

                if (expMatch && expNotMatch &&
                    ((!matchedRule.path.maxLength && !matchedRule.path.maxLength) || !correctLength)) {

                    this.publishAlert(messagePrefix,
                        matchedRule.prefix,
                        matchedRule,
                        message,
                        {
                            lengthViolation: !correctLength
                        });
                }
            }

            resolve(true);
        });

}