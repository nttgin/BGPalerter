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

import cluster from "cluster";
import fs from "fs";
import inputYml from "./inputs/inputYml"; // Default input connector

export default class Worker {
    constructor({ configFile, volume, configConnector, inputConnector, groupFile }) {
        global.EXTERNAL_CONFIG_CONNECTOR = global.EXTERNAL_CONFIG_CONNECTOR || configConnector;
        global.EXTERNAL_INPUT_CONNECTOR = global.EXTERNAL_INPUT_CONNECTOR || inputConnector;
        global.EXTERNAL_CONFIG_FILE = global.EXTERNAL_CONFIG_FILE || configFile;
        global.EXTERNAL_GROUP_FILE = global.EXTERNAL_GROUP_FILE || groupFile;
        global.EXTERNAL_VOLUME_DIRECTORY = global.EXTERNAL_VOLUME_DIRECTORY || volume;

        const env = require("./env");

        this.config = env.config;
        this.logger = env.logger;
        this.input = new (global.EXTERNAL_INPUT_CONNECTOR || inputYml)(env);
        this.pubSub = env.pubSub;
        this.version = env.version;

        if (!this.config.multiProcess) {
            const Consumer = require("./consumer").default;

            this.main();
            new Consumer(env, this.input);

        } else {
            if (cluster.isMaster) {
                this.main(cluster.fork());
            } else {
                const Consumer = require("./consumer").default;
                new Consumer(env, this.input);
            }
        }

    };

    main = (worker) => {
        const LossyBuffer = require("./utils/lossyBuffer").default;
        const ConnectorFactory = require("./connectorFactory").default;

        console.log("BGPalerter, version:", this.version, "environment:", this.config.environment);

        // Write pid on a file
        if (this.config.pidFile) {
            try {
                fs.writeFileSync(this.config.pidFile, (process.pid || "").toString());
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
                message: "The uptime monitor configuration changed."
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
        return connectorFactory
            .connectConnectors(this.input)
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


