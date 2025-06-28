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

import axios from "redaxios";
import axiosEnrich from "../utils/axiosEnrich";
import ipUtils from "ip-sub";

export default class Connector {

    constructor(name, params, env) {
        this.version = env.version;
        this.config = env.config;
        this.logger = env.logger;
        this.pubSub = env.pubSub;
        this.params = params;
        this.name = name;
        this.messageCallback = null;
        this.connectCallback = null;
        this.errorCallback = null;
        this.disconnectCallback = null;

        this.axios = axiosEnrich(axios, `${env.clientId}/${env.version}`);
    }

    static transform = (message) => {
        throw new Error("The method transform (STATIC) MUST be implemented");
    };

    _parseFilters = (callback) => {
        const {blacklistSources = []} = this.params;

        if (blacklistSources) {
            const filters = {
                asns: blacklistSources.filter(i => Number.isInteger(i)),
                prefixes: blacklistSources.filter(i => ipUtils.isValidPrefix(i) || ipUtils.isValidIP(i)).map(i => ipUtils.toPrefix(i))
            };

            const generateCallback = (filters, callback) => {
                return (message) => {
                    const {data} = message;

                    if (data && (data.peerAS || data.peer)) {
                        const messagePeer = ipUtils.toPrefix(data.peer);
                        if (!filters.prefixes.some(prefix => ipUtils.isEqualPrefix(prefix, messagePeer) || ipUtils.isSubnet(prefix, messagePeer))
                            && !filters.asns.includes(data.peerAS)) {
                            return callback(message);
                        }
                    } else {
                        return callback(message);
                    }
                };
            };

            return generateCallback(filters, callback);
        } else {
            return null;
        }
    };

    connect = () =>
        new Promise((resolve, reject) => reject(new Error("The method connect MUST be implemented")));

    _error = (error) => {
        if (this.errorCallback) {
            this.errorCallback(error);
        }
    };

    subscribe = (input) => {
        throw new Error("The method subscribe MUST be implemented");
    };

    _disconnect = (message) => {
        this.connected = false;
        if (this.disconnectCallback) {
            this.disconnectCallback(message);
        }
    };

    _message = (message) => {
        if (this.messageCallback) {
            this.messageCallback(message);
        }
    };

    _connect = (message) => {
        this.connected = true;
        if (this.connectCallback) {
            this.connectCallback(message);
        }
    };

    onConnect = (callback) => {
        this.connectCallback = callback;
    };

    onMessage = (callback) => {
        const filterCallback = this._parseFilters(callback);

        if (filterCallback) {
            this.messageCallback = filterCallback;
        } else {
            this.messageCallback = callback;
        }
    };

    onError = (callback) => {
        this.errorCallback = callback;
    };

    onDisconnect = (callback) => {
        this.disconnectCallback = callback;
    };

    disconnect = () => {
        throw new Error('The method disconnect MUST be implemented');
    };
}