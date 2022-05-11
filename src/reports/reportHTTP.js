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

export default class ReportHTTP extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);

        this.name = "reportHTTP" || this.params.name;
        this.enabled = true;

        if (!this.getUserGroup("default")) {
            this.logger.log({
                level: 'error',
                message: `${this.name} reporting is not enabled: no default group defined`
            });
            this.enabled = false;
        }

        this.headers = this.params.headers || {};
        if (this.params.isTemplateJSON) {
            this.headers["Content-Type"] = "application/json";
        }
    }

    getUserGroup = (group) => {
        const groups = this.params.hooks || this.params.userGroups || {};

        return groups[group] || groups["default"];
    };

    getTemplate = (group, channel, content) => {
        return this.params.templates[channel] || this.params.templates["default"];
    };

    _sendHTTPMessage = (group, channel, content) => {
        const url = this.getUserGroup(group);
        if (url) {
            const context = this.getContext(channel, content);

            if (this.params.showPaths > 0 && context.pathNumber > 0) {
                context.summary = `${context.summary}. Top ${context.pathNumber} most used AS paths: ${context.paths}.`;
            }
            const blob = this.parseTemplate(this.getTemplate(group, channel, content), context);

            this.logger.log({
                level: 'info',
                message: `[${this.name}] sending report to: ${url}`
            });

            this.axios({
                url,
                method: "POST",
                headers: this.headers,
                data: (this.params.isTemplateJSON) ? JSON.parse(blob) : blob
            })
                .catch((error) => {
                    this.logger.log({
                        level: 'error',
                        message: error
                    });
                });
        }
    };

    report = (channel, content) => {
        if (this.enabled) {
            let groups = content.data.map(i => i.matchedRule.group).filter(i => i != null);

            groups = (groups.length) ? [...new Set(groups)] : ["default"];

            for (let group of groups) {
                this._sendHTTPMessage(group, channel, content);
            }
        }
    };
}