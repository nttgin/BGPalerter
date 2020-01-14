
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

export default class Connector {

    constructor(name, params, env){
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

        this.timerBatch = null;
        this.batch = [];
        this.batchInterval = 500;
    }

    connect = () =>
        new Promise((resolve, reject) => reject(new Error('The method connect MUST be implemented')));


    _error = (error) => {
        if (this.errorCallback)
            this.errorCallback(error);
    };

    subscribe = (input) => {
        throw new Error('The method subscribe MUST be implemented');
    };

    _disconnect = (message) => {
        if (this.disconnectCallback)
            this.disconnectCallback(message);
    };

    _sendBatch = () => {
        clearTimeout(this.timerBatch);
        delete this.timerBatch;
        if (this.messageCallback && this.batch.length) {
            this.messageCallback(this.name + "-" + '[' + this.batch.join(',') + ']');
        }
        this.batch = [];
    };

    _message = (message) => {
        if (!this.timerBatch) {
            this.timerBatch = setTimeout(this._sendBatch, this.batchInterval);
        }
        this.batch.push(message);
    };

    _connect = (message) => {
        if (this.connectCallback)
            this.connectCallback(message);
    };

    static transform = (message) => {
        throw new Error('The method transform (STATIC) MUST be implemented');
    };

    onConnect = (callback) => {
        this.connectCallback = callback;
    };

    onMessage = (callback) => {
        this.messageCallback = callback;
    };

    onError = (callback) => {
        this.errorCallback = callback;
    };

    onDisconnect = (callback) => {
        this.disconnectCallback = callback;
    };

}