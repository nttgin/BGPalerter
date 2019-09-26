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

export default class MonitorNewPrefix extends Monitor {

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.updateMonitoredPrefixes();
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredMoreSpecifics();
    };

    filter = (message) => {
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {
        return alerts[0].message;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {

            const messagePrefix = message.prefix;
            const matchedRule = this.getMoreSpecificMatch(messagePrefix);

            if (matchedRule && matchedRule.asn.includes(message.originAS) && matchedRule.prefix !== messagePrefix) {
                const text = `Possible change of configuration. A new prefix ${message.prefix} is announced by ${message.originAS}. It is a more specific of ${matchedRule.prefix} (${matchedRule.description}).`;

                this.publishAlert(message.originAS.getId() + "-" + message.prefix,
                    text,
                    matchedRule.asn.getId(),
                    matchedRule,
                    message,
                    {});
            }

            resolve(true);
        });

}