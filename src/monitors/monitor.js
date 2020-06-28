
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

import axios from "axios";

export default class Monitor {

    constructor(name, channel, params, env) {
        this.config = env.config;
        this.pubSub = env.pubSub;
        this.logger = env.logger;
        this.input = env.input;
        this.storage = env.storage;
        this.params = params || {};
        this.maxDataSamples = this.params.maxDataSamples || 1000;
        this.name = name;
        this.channel = channel;
        this.monitored = [];

        if (!this.params.noProxy && env.agent) {
            axios.defaults.httpsAgent = env.agent;
        }
        this.axios = axios;

        this.alerts = {}; // Dictionary containing the alerts <id, Array>. The id is the "group" key of the alert.
        this.sent = {}; // Dictionary containing the last sent unix timestamp of each group <id, int>
        this.truncated = {}; // Dictionary containing <id, boolean> if the alerts Array for "id" is truncated according to maxDataSamples
        this.fadeOff = {}; // Dictionary containing the last alert unix timestamp of each group  <id, int> which contains alerts that have been triggered but are not ready yet to be sent (e.g. thresholdMinPeers not yet reached)

        this._retrieveStatus();
        this.internalConfig = {
            notificationInterval: (this.config.notificationIntervalSeconds || 14400) * 1000,
            checkFadeOffGroups: (this.config.checkFadeOffGroupsSeconds || 30) * 1000,
            fadeOff:  this.config.fadeOffSeconds * 1000 || 60 * 6 * 1000
        };

        setInterval(this._publishFadeOffGroups, this.internalConfig.checkFadeOffGroups);

        this.input.onChange(() => {
            this.updateMonitoredResources();
        });
    };

    updateMonitoredResources = () => {
        throw new Error('The method updateMonitoredResources must be implemented in ' + this.name);
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {
            reject("You must implement a monitor method");
        });

    filter = (message) => {
        throw new Error('The method filter must be implemented in ' + this.name);
    };

    squashAlerts = (alerts) => {
        throw new Error('The method squashAlerts must be implemented in ' + this.name);
    };

    _squash = (id) => {

        const alerts = this.alerts[id];
        const message = this.squashAlerts(alerts);

        if (message) {
            const firstAlert = alerts[0];
            let earliest = Infinity;
            let latest = -Infinity;

            for (let alert of alerts) {
                earliest = Math.min(alert.timestamp, earliest);
                latest = Math.max(alert.timestamp, latest);
            }

            return {
                id,
                truncated: this.truncated[id] || false,
                origin: this.name,
                earliest,
                latest,
                affected: firstAlert.affected,
                message,
                data: alerts
            }
        }
    };

    publishAlert = (id, affected, matchedRule, matchedMessage, extra) => {
        const now = new Date().getTime();
        const context = {
            timestamp: now,
            affected,
            matchedRule,
            matchedMessage,
            extra
        };

        if (!this.sent[id] ||
            (!this.config.alertOnlyOnce && now > (this.sent[id] + this.internalConfig.notificationInterval))) {

            this.alerts[id] = this.alerts[id] || [];
            this.alerts[id].push(context);

            // Check if for each alert group the maxDataSamples parameter is respected
            if (!this.truncated[id] && this.alerts[id].length > this.maxDataSamples) {
                this.truncated[id] = this.alerts[id][0].timestamp; // Mark as truncated
                this.alerts[id] = this.alerts[id].slice(-this.maxDataSamples); // Truncate
            }

            this._publishGroupId(id, now);

            return true;
        }

        return false;
    };

    _publishFadeOffGroups = () => {
        const now = new Date().getTime();

        for (let id in this.fadeOff) {
            this._publishGroupId(id, now);
        }

        if (!this.config.alertOnlyOnce) {
            for (let id in this.alerts) {
                if (now > (this.sent[id] + this.internalConfig.notificationInterval)) {
                    delete this.sent[id];
                }
            }
        }

        this._persistStatus();
    };

    _retrieveStatus = () => {
        if (this.storage) {
            this.storage.get("status")
                .then(({ alerts={}, sent={}, truncated={}, fadeOff={} }) => {
                    this.alerts = alerts;
                    this.sent = sent;
                    this.truncated = truncated;
                    this.fadeOff = fadeOff;
                })
                .catch(error => {
                    this.logger.log({
                        level: 'error',
                        message: error
                    });
                });
        }
    };

    _persistStatus = () => {
        if (this.storage) {
            const status = {
                alerts: this.alerts,
                sent: this.sent,
                truncated: this.truncated,
                fadeOff: this.fadeOff
            };

            if (Object.values(status).some(i => Object.keys(i).length > 0)) { // If there is anything in the cache
                this.storage.set("status", status)
                    .catch(error => {
                        this.logger.log({
                            level: 'error',
                            message: error
                        });
                    });
            }
        }
    };

    _publishGroupId = (id, now) => {
        const group = this._squash(id);

        if (group) {
            this._publishOnChannel(group);
            this.sent[id] = now;

            delete this.alerts[id];
            delete this.fadeOff[id];
            delete this.truncated[id];

        } else if (this.fadeOff[id]) {

            if (now > this.fadeOff[id] + this.internalConfig.fadeOff) {
                delete this.fadeOff[id];
                delete this.alerts[id];
                delete this.truncated[id];
            }

        } else {
            this.fadeOff[id] = this.fadeOff[id] || now;
        }
    };

    _publishOnChannel = (alert) => {

        this.pubSub.publish(this.channel, alert);

        return alert;
    };

    getMonitoredAsMatch = (originAS) => {
        const monitored = this.input.getMonitoredASns();

        for (let m of monitored) {
            if (originAS.includes(m.asn)) {
                return m;
            }
        }
    };

    getMoreSpecificMatch = (prefix, includeIgnoredMorespecifics) => {
        const matched = this.input.getMoreSpecificMatch(prefix, includeIgnoredMorespecifics);

        if (matched) {
            if (matched.includeMonitors.length > 0 && !matched.includeMonitors.includes(this.name)) {
                return null;
            }

            return (matched.excludeMonitors.includes(this.name)) ? null : matched;
        }
    };

}