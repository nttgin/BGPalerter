
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
        this.params = params;
        this.name = name;
        this.channel = channel;
        this.monitored = [];
        this.alerts = {};
        this.sent = {};

        this.internalConfig = {
            notificationIntervalSeconds: this.config.notificationIntervalSeconds,
            checkStaleNotificationsSeconds: 60,
            clearNotificationQueueAfterSeconds: (this.config.notificationIntervalSeconds * 3) / 2
        };
        this.updateMonitoredPrefixes();
        setInterval(this._publish, this.internalConfig.checkStaleNotificationsSeconds * 1000);
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredPrefixes();
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

    _squash = (alerts) => {

        const message = this.squashAlerts(alerts);

        if (message) {
            const firstAlert = alerts[0];
            const id = firstAlert.id;
            let earliest = Infinity;
            let latest = -Infinity;

            for (let alert of alerts) {

                earliest = Math.min(alert.timestamp, earliest);
                latest = Math.max(alert.timestamp, latest);

                if (id !== alert.id) {
                    throw new Error('Squash MUST receive a list of events all with the same ID.');
                }
            }

            return {
                id,
                origin: this.name,
                earliest,
                latest,
                affected: firstAlert.affected,
                message,
                data: alerts.map(a => {
                    return {
                        extra: a.extra,
                        matchedRule: a.matchedRule,
                        matchedMessage: a.matchedMessage,
                        timestamp: a.timestamp
                    };
                })
            }
        }
    };

    publishAlert = (id, message, affected, matchedRule, matchedMessage, extra) => {

        const context = {
            id,
            timestamp: new Date().getTime(),
            message,
            affected,
            matchedRule,
            matchedMessage,
            extra
        };

        if (!this.alerts[id]) {
            this.alerts[id] = [];
        }

        this.alerts[id].push(context);

        if (!this.sent[id]) {
            this._publish();
        }
    };

    _clean = (group) => {

        if (new Date().getTime() > group.latest + (this.internalConfig.clearNotificationQueueAfterSeconds * 1000)) {
            delete this.alerts[group.id];
            delete this.sent[group.id];

            return true;
        }

        return false;
    };

    _checkLastSent = (group) => {
        const lastTimeSent = this.sent[group.id];

        if (lastTimeSent) {

            const isThereSomethingNew = lastTimeSent < group.latest;
            const isItTimeToSend = new Date().getTime() > lastTimeSent + (this.internalConfig.notificationIntervalSeconds * 1000);

            return isThereSomethingNew && isItTimeToSend;
        } else {
            return true;
        }
    };

    _publish = () => {

        for (let id in this.alerts) {
            const group = this._squash(this.alerts[id]);

            if (group) {
                if (this._checkLastSent(group)) {
                    this.sent[group.id] = new Date().getTime();
                    this._publishOnChannel(group);
                }

                this._clean(group);
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