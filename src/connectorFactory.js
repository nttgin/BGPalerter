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

import env, {logger} from "./env";

export default class ConnectorFactory {

    constructor() {
        this.connectors = {};
    }

    getConnector = (name) => {
        return this.connectors[name];
    };

    getConnectors = () => {
        return Object.keys(this.connectors).map(name => this.connectors[name]);
    };

    loadConnectors = () => {
        const connectors = Object.keys(this.connectors);
        if (connectors.length === 0) {

            for (let connector of env.config.connectors) {
                this.connectors[connector.name] = new connector.class(connector.name, connector.params || {}, env);
            }
        }
    };

    connectConnectors = () =>
        new Promise((resolve, reject) => {
            const connectors = this.getConnectors();

            if (connectors.length === 0) {
                reject(new Error("No connections available"));

            } else {
                resolve(Promise.all(connectors
                    .map(connector =>
                        new Promise((resolve, reject) => {

                            connector.onError(error => {
                                logger.log({
                                    level: 'error',
                                    message: error
                                });
                            });

                            connector.onConnect(message => {
                                connector.connected = true;
                                logger.log({
                                    level: 'info',
                                    message: message
                                });
                            });

                            connector.onDisconnect(error => {
                                connector.connected = false;

                                if (error) {
                                    logger.log({
                                        level: 'error',
                                        message: error
                                    });
                                } else {
                                    logger.log({
                                        level: 'info',
                                        message: connector.name + ' disconnected'
                                    });
                                }
                            });


                            connector
                                .connect()
                                .then(() => {
                                    connector.connected = true;
                                    resolve(true);
                                })
                                .catch((error) => {
                                    env.logger.log({
                                        level: 'error',
                                        message: error
                                    });
                                    resolve(false);
                                })
                        }))));
            }
        });

    subscribeConnectors = (params, callback) =>
        new Promise((resolve, reject) => {

            const connectors = this.getConnectors();

            if (connectors.length === 0) {
                reject(new Error("No connections available"));
            } else {
                const connectorList = connectors
                    .map(connector => connector.subscribe(params));

                resolve(Promise.all(connectorList));
            }

        })
}