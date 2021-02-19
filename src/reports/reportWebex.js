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

import Report from "./report";

export default class ReportWebex extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);


        if (!this.getUserGroup("default")) {
            this.logger.log({
                level: 'error',
                message: `Webex reporting is not enabled: no default group defined`
            });
            this.enabled = false;
        }
    };

    getUserGroup = (group) => {
        const groups = this.params.hooks || this.userGroups;

        return groups[group] || groups["default"];
    };

    _sendWebexMessage = (url, message, content) => {

        this.axios({
            url: url,
            method: "POST",
            resposnseType: "json",
            data: {
                markdown: `**${message}**: ${content.message}`
            }
        })
            .catch((error) => {
                this.logger.log({
                    level: 'error',
                    message: error
                });
            })
    };

    report = (message, content) => {
        if (this.enabled){
            let groups = content.data.map(i => i.matchedRule.group).filter(i => i != null);

            groups = (groups.length) ? [...new Set(groups)] : [this.getUserGroup("default")];

            for (let group of groups) {
                if (this.params.hooks[group]) {
                    this._sendWebexMessage(this.params.hooks[group], message, content);
                }
            }
        }

    }
}
