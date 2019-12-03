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
import restify from "restify";
import errors from "restify-errors";

export default class Uptime {

    constructor(connectors){
        this.server = null;

        this.connectors = connectors;
        this.activate();
    };

    respond = (req, res, next) => {
        res.contentType = 'json';
        const response = this.getCurrentStatus();
        if (env.config.uptimeMonitor.useStatusCodes && response.warning) {
            res.status(500);
        }
        res.send(response);
        next();
    };

    activate = () => {
        this.server = restify.createServer();
        this.server.get('/status', this.respond);
        this.server.head('/status', this.respond);
        this.server.listen(env.config.uptimeMonitor.port, () => {});
    };

    getCurrentStatus = () => {
        const connectors = this.connectors
            .getConnectors()
            .filter(connector => {
                return connector.constructor.name != "ConnectorSwUpdates";
            })
            .map(connector => {
                return {
                    name: connector.constructor.name,
                    connected: connector.connected
                };
            });

        const disconnected = connectors.some(connector => !connector.connected);
        return {
            warning: disconnected,
            connectors,
        };

    };

}


