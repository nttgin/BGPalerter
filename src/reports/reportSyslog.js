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
import syslog from "syslog-client";

export default class ReportSyslog extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);
        this.client = null;
        this.connected = false;
        this.connecting = null;
        this.host = params.host;
        this.options = {
            syslogHostname: params.host,
            transport: syslog.Transport.Udp,
            port: params.port
        };
    }


    _getMessage = (channel, content) => {
        return this.parseTemplate(this.params.templates[channel] || this.params.templates["default"], this.getContext(channel, content));
    };

    _connectToSyslog = () => {
        if (!this.connecting) {
            this.connecting = new Promise((resolve, reject) => {
                if (this.connected) {
                    resolve(true);
                } else {
                    this.client = syslog.createClient(this.host, this.options);
                    this.connected = true;

                    this.client.on("close", function () {
                        this.logger.log({
                            level: 'error',
                            message: 'Syslog disconnected: ' + error
                        });
                    });

                    this.client.on("error", function () {
                        this.logger.log({
                            level: 'error',
                            message: 'Syslog: ' + error
                        });
                    });

                    resolve(true);
                }
            });
        }

        return this.connecting;
    };

    report = (channel, content) => {
        return this._connectToSyslog()
            .then(() => {
                const message = this._getMessage(channel, content);

                this.client.log(message, {}, error => {
                    if (error) {
                        this.logger.log({
                            level: 'error',
                            message: 'Syslog: ' + error
                        });
                    }
                });
            });
    };

}