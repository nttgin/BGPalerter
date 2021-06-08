
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

export default class MonitorRPKI extends Monitor {

    constructor(name, channel, params, env, input){
        super(name, channel, params, env, input);

        // Warn about deprecated config parameters
        for (const configParamKey of Object.keys(params)) {
            const deprecated = ["preCacheROAs", "refreshVrpListMinutes", "vrpFile", "vrpProvider"];
            if (deprecated.includes(configParamKey)) {
                this.logger.log({
                    level: 'error',
                    message: `The parameters ${deprecated.join(",")} are deprecated in monitorRPKI. Please use see here: https://github.com/nttgin/BGPalerter/blob/master/docs/rpki.md`
                });
            }
        }

        this.rpki = env.rpki;
        this.cacheValidPrefixesMs = (this.params.cacheValidPrefixesSeconds || 3600 * 24 * 7) * 1000;
        this.input.onChange(() => {
            this.updateMonitoredResources();
        });

        this.thresholdMinPeers = (params && params.thresholdMinPeers != null) ? params.thresholdMinPeers : 1;
        this.seenRpkiValidAnnouncementsKey = "seen-rpki-valid-announcements";

        this.storage // Reload the previously discovered ROAs (needed to alert in case of disappearing ROAs)
            .get(this.seenRpkiValidAnnouncementsKey)
            .then(prefixes => {
                this.seenRpkiValidAnnouncements = (prefixes) ? prefixes : {};
            })
            .catch(error => {
                this.logger.log({
                    level: 'error',
                    message: error
                });
            });

        this.queue = [];
    };

    updateMonitoredResources = () => {
        this.monitored = this.input.getMonitoredASns();
    };

    filter = (message) => {
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {

        const peers = [...new Set(alerts.map(alert => alert.matchedMessage.peer))].length;

        if (peers >= this.thresholdMinPeers) {
            const firstAlert = alerts[0];
            const message = firstAlert.matchedMessage;
            const extra = firstAlert.extra;
            const covering = (extra.covering && extra.covering.length) ? extra.covering.map(i => `${i.prefix}|AS${i.asn}|maxLength:${i.maxLength}`).join(", ") : false;
            const coveringString = (covering) ? `. Valid ROAs: ${covering}`: '';

            if (extra.roaDisappeared && this.params.checkDisappearing) {
                return `The route ${message.prefix} announced by ${message.originAS} is no longer covered by a ROA`;
            } else if (extra.valid === null && this.params.checkUncovered) {
                return `The route ${message.prefix} announced by ${message.originAS} is not covered by a ROA`;
            } else if (extra.valid === false) {
                return `The route ${message.prefix} announced by ${message.originAS} is not RPKI valid${coveringString}`;
            }
        }
    };

    _validate = (result, message, matchedRule) => {
        const prefix = result.prefix;
        const origin = result.origin.getValue();
        if (result) {

            const cacheKey = "a" + [prefix, origin]
                .join("-")
                .replace(/\./g, "_")
                .replace(/\:/g, "_")
                .replace(/\//g, "_");

            const key = `${cacheKey}-${result.valid}`;

            if (result.valid === null) {

                const cache = this.seenRpkiValidAnnouncements[cacheKey];
                if (cache && cache.rpkiValid && (cache.date + this.cacheValidPrefixesMs) >= new Date().getTime()) { // valid cache
                    this.publishAlert(key,
                        prefix,
                        matchedRule,
                        message,
                        { covering: null, valid: null, roaDisappeared: true });
                } else if (this.params.checkUncovered) {
                    this.publishAlert(key,
                        prefix,
                        matchedRule,
                        message,
                        { covering: null, valid: null });
                }
            } else if (result.valid === false) {
                this.publishAlert(key,
                    prefix,
                    matchedRule,
                    message,
                    { covering: result.covering, valid: false });

            } else if (result.valid) {

                // Refresh dictionary
                this.seenRpkiValidAnnouncements[cacheKey] = {
                    date: new Date().getTime(),
                    rpkiValid: true
                };

                if (this.seenRpkiValidAnnouncementsTimer) {
                    clearTimeout(this.seenRpkiValidAnnouncementsTimer);
                }

                // Store dictionary
                this.seenRpkiValidAnnouncementsTimer = setTimeout(() => {
                    const now = new Date().getTime();

                    // Delete old cache items
                    for (let roa of Object.keys(this.seenRpkiValidAnnouncements)) {
                        if (this.seenRpkiValidAnnouncements[roa].date + this.cacheValidPrefixesMs < now) {
                            delete this.seenRpkiValidAnnouncements[roa];
                        }
                    }
                    this.storage
                        .set(this.seenRpkiValidAnnouncementsKey, this.seenRpkiValidAnnouncements)
                        .catch(error => {
                            this.logger.log({
                                level: 'error',
                                message: error
                            });
                        });
                }, 1000);

            }
        }
    };

    validate = (message, matchedRule) => {
        this.rpki.addToValidationQueue(message, matchedRule, this._validate);
    };

    monitor = (message) => {
        try {
            const messageOrigin = message.originAS;
            const prefix = message.prefix;

            const matchedPrefixRule = this.getMoreSpecificMatch(prefix, false, true);

            if (matchedPrefixRule && matchedPrefixRule.matched) { // There is a prefix match
                if (!matchedPrefixRule.matched.ignore && matchedPrefixRule.included) { // The prefix match is not excluded in any way
                    this.validate(message, matchedPrefixRule.matched);
                }
            } else { // No prefix match
                const matchedASRule = this.getMonitoredAsMatch(messageOrigin); // Try AS match
                if (matchedASRule) {
                    this.validate(message, matchedASRule);
                }
            }
        } catch (error) {
            this.logger.log({
                level: 'error',
                message: error
            });
        }

        return Promise.resolve(true);
    };
}
