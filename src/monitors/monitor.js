
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

export default class Monitor {

    constructor(name, channel, params, env) {
        this.config = env.config;
        this.pubSub = env.pubSub;
        this.logger = env.logger;
        this.input = env.input;
        this.params = params || {};
        this.maxDataSamples = this.params.maxDataSamples || 1000;
        this.name = name;
        this.channel = channel;
        this.monitored = [];
        this.alerts = {};
        this.sent = {};
        this.truncated = {};
        this.fadeOff = {};

        this.internalConfig = {
            notificationInterval: this.config.notificationIntervalSeconds * 1000,
            checkStaleNotifications: 60 * 1000,
            fadeOff:  5 * 60 * 1000,
            clearNotificationQueueAfterSeconds: (this.config.notificationIntervalSeconds * 1000 * 3) / 2
        };

        setInterval(this._publish, this.internalConfig.checkStaleNotifications);
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
                truncated: this.truncated[id],
                origin: this.name,
                earliest,
                latest,
                affected: firstAlert.affected,
                message,
                data: alerts
                // .map(a => {
                //     return {
                //         extra: a.extra,
                //         matchedRule: a.matchedRule,
                //         matchedMessage: a.matchedMessage,
                //         timestamp: a.timestamp
                //     };
                // })
            }
        }
    };

    publishAlert = (id, affected, matchedRule, matchedMessage, extra) => {

        const context = {
            // id,
            timestamp: new Date().getTime(),
            affected,
            matchedRule,
            matchedMessage,
            extra
        };

        if (this.config.alertOnlyOnce && this.sent[id]) {

            return false;

        } else {

            this.alerts[id] = this.alerts[id] || [];
            this.alerts[id].push(context);

            // Check if for each alert group the maxDataSamples parameter is respected
            if (!this.truncated[id] && this.alerts[id].length > this.maxDataSamples) {
                this.truncated[id] = this.alerts[id][0].timestamp; // Mark as truncated
                this.alerts[id] = this.alerts[id].slice(-this.maxDataSamples); // Truncate
            }

            if (!this.sent[id]) {
                this._publish(id);
            }

            return true;
        }
    };

    _clean = (group) => {
        if (this.config.alertOnlyOnce) {
            delete this.alerts[group.id];
            delete this.fadeOff[group.id];
            delete this.truncated[group.id];
        } else if (new Date().getTime() > group.latest + (this.internalConfig.clearNotificationQueueAfterSeconds * 1000)) {
            delete this.alerts[group.id];
            delete this.fadeOff[group.id];
            delete this.truncated[group.id];
            delete this.sent[group.id];

            return true;
        }

        return false;
    };

    _checkLastSent = (group) => {
        const lastTimeSent = this.sent[group.id];

        if (lastTimeSent && this.config.alertOnlyOnce) {
            return false;
        } else if (lastTimeSent) {

            const isThereSomethingNew = lastTimeSent < group.latest;
            const isItTimeToSend = new Date().getTime() > lastTimeSent + this.internalConfig.notificationIntervalSeconds;

            return isThereSomethingNew && isItTimeToSend;
        } else {
            return true;
        }
    };

    _publish = (id) => {

        const now = new Date().getTime();
        let alerts;

        if (id) {
            alerts = { [id]: this.alerts[id] };
        } else {
            alerts = this.alerts;
        }

        for (let id in alerts) {

            if (now > this.fadeOff[id] + this.internalConfig.fadeOff) {
                delete this.fadeOff[id];
                delete this.alerts[id];
                delete this.truncated[id];
            } else {

                const group = this._squash(id);

                if (group) {
                    if (this._checkLastSent(group)) {
                        this.sent[group.id] = now;
                        this._publishOnChannel(group);
                    }

                    this._clean(group);
                } else {
                    this.fadeOff[id] = this.fadeOff[id] || now;
                }
            }
        }

    };

    _publishOnChannel = (alert) => {

        this.pubSub.publish(this.channel, alert);

        return alert;
    };

    getMoreSpecificMatch = (prefix) => {
        const matched = this.input.getMoreSpecificMatch(prefix);

        if (matched) {
            if (matched.includeMonitors.length > 0 && !matched.includeMonitors.includes(this.name)) {
                return null;
            }

            return (matched.excludeMonitors.includes(this.name)) ? null : matched;
        }
    };

}