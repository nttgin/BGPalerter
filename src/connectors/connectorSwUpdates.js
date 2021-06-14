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

import Connector from "./connector";
import semver from "semver";

export default class ConnectorSwUpdates extends Connector{

    constructor(name, params, env) {
        super(name, params, env);
    }

    connect = () =>
        new Promise((resolve, reject) => {
            resolve(true);
        });

    _checkForUpdates = () => {
        return this.axios({
            responseType: "json",
            url: "https://raw.githubusercontent.com/nttgin/BGPalerter/main/package.json"
        })
            .then(data => {

                if (data && data.data && data.data.version && semver.gt(data.data.version, this.version)) {
                    this._message({
                        type: "software-update",
                        currentVersion: this.version,
                        newVersion: data.data.version,
                        repo: "https://github.com/nttgin/BGPalerter"
                    });
                }
            })
            .catch(() => {
                this.logger.log({
                    level: 'error',
                    message: "It was not possible to check for software updates"
                });
            });
    };

    subscribe = (input) =>
        new Promise((resolve, reject) => {
            if (this.config.checkForUpdatesAtBoot){
                setTimeout(this._checkForUpdates, 20000); // Check after 20 seconds from boot
            }
            setInterval(this._checkForUpdates, 1000 * 3600 * 24 * 5); // Check every 5 days
            resolve(true);
        });

    static transform = (message) => {
        return [ message ];
    }
};
