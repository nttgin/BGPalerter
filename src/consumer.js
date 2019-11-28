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

import env from "./env";

export default class Consumer {

    constructor(){
        this.connectors = {};
        for (let connector of env.config.connectors) {
            this.connectors[connector.name] = connector.class
        }

        this.monitors = env.config.monitors
            .map(monitor => new monitor.class(monitor.name, monitor.channel, monitor.params, env));

        this.reports = env.config.reports
            .map(report => new report.class(report.channels, report.params, env));

        process.on('message', this.dispatch);
        env.pubSub.subscribe('data', (type, data) => {
            this.dispatch(data);
        });
    };

    dispatch = (data) => {
        try {
            const connector = data.slice(0,3);
            const messagesRaw = JSON.parse(data.slice(4));
            const messages = this.connectors[connector].transform(messagesRaw) || [];

            for (let monitor of this.monitors) {

                // Blocking filtering to reduce stack usage
                for (const message of messages.filter(monitor.filter)) {

                    // Promise call to reduce waiting times
                    monitor
                        .monitor(message)
                        .catch(error => {
                            env.logger.log({
                                level: 'error',
                                message: error
                            });
                        });
                }
            }

        } catch (error) {
            env.logger.log({
                level: 'error',
                message: error.message
            });
        }
    };

}


