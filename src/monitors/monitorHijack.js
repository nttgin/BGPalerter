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

export default class MonitorHijack extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);
        this.thresholdMinPeers = params?.thresholdMinPeers ?? 2;
        this.updateMonitoredResources();
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredPrefixes();
    };

    filter = (message) => {
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {
        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;

        if (peers >= this.thresholdMinPeers) {
            const matchedRule = alerts[0].matchedRule;
            const message = alerts[0].matchedMessage;
            const asnText = matchedRule.asn;

            return (ipUtils._isEqualPrefix(message.prefix, matchedRule.prefix)) ?
                `The prefix ${matchedRule.prefix} (${matchedRule.description}) is announced by ${message.originAS} instead of ${asnText}` :
                `A new prefix ${message.prefix} is announced by ${message.originAS}. ` +
                `It should be instead ${matchedRule.prefix} (${matchedRule.description}) announced by ${asnText}`;
        }

        return false;
    };

    validate = (message, matchedRule) => {
        this.rpki.addToValidationQueue(message, matchedRule, this._validate);
    };

    _validate = (result, message, matchedRule) => {
        if (!result.valid) {
            this.publishAlert(message.originAS.getId() + "-" + message.prefix,
                matchedRule.asn.getId(),
                matchedRule,
                message,
                {});
        }
    }

    monitor = (message) =>{
        const messagePrefix = message.prefix;
        const matchedRules = this.getMoreSpecificMatches(messagePrefix, false);

        for (let matchedRule of matchedRules) {
            if (!matchedRule.ignore && !matchedRule.asn.includes(message.originAS)) {
                this.validate(message, matchedRule);
            }
        }

        return Promise.resolve(true);
    }

}