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

export default class ReportAlerta extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);

        this.environment = env.config.environment;
        this.enabled = true;
        if (!this.getUserGroup("default")) {
            this.logger.log({
                level: "error",
                message: "Alerta is not enabled: no default group defined"
            });
            this.enabled = false;
        }

        this.headers = {};
        if (this.params.key) {
            this.headers.Authorization = "Key " + this.params.key;
        }
        if (this.params.token) {
            this.headers.Authorization = "Bearer " + this.params.token;
        }

    }

    _createAlertaAlert = (url, channel, content) => {

        const severity = (this.params && this.params.severity && this.params.severity[channel])
            ? this.params.severity[channel]
            : "informational"; // informational level
        const context = this.getContext(channel, content);

        if (this.params.resource_templates) {
            this.logger.log({
                level: "info",
                message: "The resource_templates parameter is deprecated in favour of resourceTemplates. Please update your config.yml file accordingly."
            });
        }

        const resource = this.params.resourceTemplates[channel] || this.params.resourceTemplates["default"];

        this.axios({
            url: url + "/alert",
            method: "POST",
            headers: this.headers,
            responseType: "json",
            data: {
                event: channel,
                resource: this.parseTemplate(resource, context),
                text: content.message,
                service: ["BGPalerter"],
                attributes: context,
                severity: severity,
                environment: this.environment
            }
        })
            .catch((error) => {
                this.logger.log({
                    level: "error",
                    message: error
                });
            });
    };

    getUserGroup = (group) => {
        const groups = this.params.urls || this.params.userGroups;

        return groups[group] || groups["default"];
    };

    report = (channel, content) => {
        if (this.enabled) {
            let groups = content.data.map(i => i.matchedRule.group).filter(i => i != null);

            groups = (groups.length) ? [...new Set(groups)] : ["default"];

            for (let group of groups) {
                const url = this.getUserGroup(group);
                if (url) {
                    this._createAlertaAlert(url, channel, content);
                }
            }
        }
    };
}
