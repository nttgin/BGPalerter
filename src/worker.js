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

import Consumer from "./consumer";
import LossyBuffer from "./utils/lossyBuffer";
import ConnectorFactory from "./connectorFactory";
import cluster from "cluster";
import fs from "fs";

export default class Worker {
    constructor(configFile, volume) {
        global.EXTERNAL_CONFIG_FILE = configFile;

        const env = require("./env");
        this.config = env.config;
        this.logger = env.logger;
        this.input = env.input;
        this.pubSub = env.pubSub;
        this.version = env.version;
        this.configFile = env.configFile;

        if (env.sentryDSN) {
            const Sentry = require('@sentry/node');
            Sentry.init({ dsn: env.sentryDSN });
        }

        if (!this.config.multiProcess) {

            this.master();
            new Consumer();

        } else {
            if (cluster.isMaster) {
                this.master(cluster.fork());
            } else {
                new Consumer();
            }
        }

    };

    master = (worker) => {
        console.log("BGPalerter, version:", this.version, "environment:", this.config.environment);
        console.log("Loaded config:", this.configFile);

        // Write pid on a file
        if (this.config.pidFile) {
            try {
                fs.writeFileSync(this.config.pidFile, process.pid);
            } catch (error) {
                this.logger.log({
                    level: 'error',
                    message: "Cannot write pid file: " + error
                });
            }
        }

        const connectorFactory = new ConnectorFactory();

        if (this.config.uptimeMonitor) {
            this.logger.log({
                level: 'error',
                message: "The uptime monitor configuration changed. Please see the documentation https://github.com/nttgin/BGPalerter/blob/master/docs/process-monitors.md"
            });
        }

        if (this.config.processMonitors) {
            for (let uptimeEntry of this.config.processMonitors) {
                const UptimeModule = require("./processMonitors/" + uptimeEntry.file).default;
                new UptimeModule(connectorFactory, uptimeEntry.params);
            }
        }

        const bufferCleaningInterval = 200;
        this.config.maxMessagesPerSecond = this.config.maxMessagesPerSecond || 6000;
        const buffer = new LossyBuffer(parseInt(this.config.maxMessagesPerSecond /(1000/bufferCleaningInterval)), bufferCleaningInterval, this.logger);
        connectorFactory.loadConnectors();
        return connectorFactory.connectConnectors(this.input)
            .then(() => {
                for (const connector of connectorFactory.getConnectors()) {

                    connector.onMessage((message) => {
                        buffer.add({
                            connector: connector.name,
                            message
                        });
                    });
                    if (worker){
                        buffer.onData((message) => {
                            worker.send(message);
                        });
                    } else {
                        buffer.onData((message) => {
                            this.pubSub.publish("data", message);
                        });
                    }

                }
            })
            .catch(error => {
                this.logger.log({
                    level: 'error',
                    message: error
                });
            });
    }
}


