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
import RestApi from "../utils/restApi";
import md5 from "md5";

export default class ReportPullAPI extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);

        this.name = "reportPullAPI" || this.params.name;
        this.enabled = true;
        this.maxAlertsAmount = this.params.maxAlertsAmount || 100;
        this.lastQuery = null;

        let restDefault = env.config.rest || { port: params.port, host: params.host };
        const rest = new RestApi(restDefault);

        rest.addUrl('/alerts', this.respond)
            .catch(error => {
                env.logger.log({
                    level: 'error',
                    message: error
                });
            });

        rest.addUrl('/alerts/:hash', this.respond)
            .catch(error => {
                env.logger.log({
                    level: 'error',
                    message: error
                });
            });

        rest.addUrl('/alerts/groups/:group', this.respond)
            .catch(error => {
                env.logger.log({
                    level: 'error',
                    message: error
                });
            });

        this.alerts = [];
    };

    respond = (req, res, next) => {
        res.contentType = 'json';
        res.send({
            meta: {
                lastQuery: this.lastQuery
            },
            data: this._getAlerts(req.params)
        });
        next();
        this.lastQuery = new Date().getTime();
    };

    _getAlerts = ({ hash, group }) => {
        let alerts;

        if (group) {
            alerts = this.alerts.filter(i => i.group === group);
        } else if (hash) {
            alerts = this.alerts.filter(i => i.alert.hash === hash);
        } else {
            alerts = this.alerts;
        }

        return alerts.map(i => i.alert);
    }

    getUserGroup = (group) => {
        return null;
    };

    report = (channel, content) => {
        if (this.enabled) {
            let groups = content.data.map(i => i.matchedRule.group).filter(i => i != null);

            groups = (groups.length) ? [...new Set(groups)] : ["default"];
            content.hash = md5(content.id);

            for (let group of groups) {
                this.alerts.push({
                    group,
                    alert: content
                });
                this.alerts = this.alerts.slice(-this.maxAlertsAmount);
            }
        }
    };
}