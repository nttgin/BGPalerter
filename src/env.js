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

import fs from "fs";
import PubSub from './utils/pubSub';
import FileLogger from 'fast-file-logger';
import { version } from '../package.json';
import Storage from './utils/storages/storageFile';
import url from 'url';
import RpkiUtils from './utils/rpkiUtils';
import ConfigYml from './config/configYml';
import Config from "./config/config";

const configConnector = new (global.EXTERNAL_CONFIG_CONNECTOR || ConfigYml);
const vector = {
    version: global.EXTERNAL_VERSION_FOR_TEST || version,
    clientId: Buffer.from("bnR0LWJncGFsZXJ0ZXI=", 'base64').toString('ascii')
};

const config = configConnector.retrieve();

if (global.DRY_RUN) {
    config.connectors = [{
        file: "connectorTest",
        name: "tes",
        params: {
            testType: "hijack"
        }
    }];
    config.monitors = [{
        file: "monitorPassthrough",
        channel: "hijack",
        name: "monitor-passthrough",
        params: {
            showPaths: 0,
            thresholdMinPeers: 0
        }
    }];
}

config.volume = config.volume || global.EXTERNAL_VOLUME_DIRECTORY || "";

if (config.volume && config.volume.length) {
    if (config.volume.slice(-1) !== "/") {
        config.volume += "/";
    }

    if (!fs.existsSync(config.volume)) {
        fs.mkdirSync(config.volume);
    }
}

if (!config.configVersion || config.configVersion < Config.configVersion) {
    console.log("Your config.yml file is old. It works, but it may not support all the new features. Update your config file or generate a new one (i.e., rename the file into config.yml.bak, run BGPalerter and proceed with the auto configuration, apply to the new config.yml the personalizations you did in config.yml.bak.");
}

const errorTransport = new FileLogger({
    logRotatePattern: config.logging.logRotatePattern,
    filename: 'error-%DATE%.log',
    symLink: 'error.log',
    directory: config.volume + config.logging.directory,
    maxRetainedFiles: config.logging.maxRetainedFiles,
    maxFileSizeMB: config.logging.maxFileSizeMB,
    compressOnRotation: config.logging.compressOnRotation,
    label: config.environment,
    useUTC: !!config.logging.useUTC,
    format: ({data, timestamp}) => `${timestamp} ${data.level}: ${data.message}`
});

const verboseTransport = new FileLogger({
    logRotatePattern: config.logging.logRotatePattern,
    filename: 'reports-%DATE%.log',
    symLink: 'reports.log',
    directory: config.volume + config.logging.directory,
    maxRetainedFiles: config.logging.maxRetainedFiles,
    maxFileSizeMB: config.logging.maxFileSizeMB,
    compressOnRotation: config.logging.compressOnRotation,
    label: config.environment,
    useUTC: !!config.logging.useUTC,
    format: ({data, timestamp}) => `${timestamp} ${data.level}: ${data.message}`
});

const loggerTransports = {
    verbose: verboseTransport,
    error: errorTransport,
    info: errorTransport
};

const wlogger = {
    log:
        function(data){
            return loggerTransports[data.level].log(data);
        }
};

config.monitors = (config.monitors || []);
config.monitors.push({
    file: "monitorSwUpdates",
    channel: "software-update",
    name: "software-update",
});


config.monitors = config.monitors
    .map(item => {
        return {
            class: require("./monitors/" + item.file).default,
            channel: item.channel,
            name: item.name,
            params: item.params
        };
    });

config.reports = (config.reports || [])
    .map(item => {

        return {
            file: item.file,
            class: require("./reports/" + item.file).default,
            channels: item.channels,
            params: item.params
        };

    });

if (!config.reports.some(report => report.channels.includes("software-update"))) { // Check if software-update channel is declared
    config.reports.forEach(report => report.channels.push("software-update")); // If not, declare it everywhere
}

config.connectors = config.connectors || [];

config.connectors.push({
    file: "connectorSwUpdates",
    name: "upd"
});

if ([...new Set(config.connectors)].length !== config.connectors.length) {
    throw new Error('Connectors names MUST be unique');
}

config.connectors = config.connectors
    .map((item, index) => {

        if (item.name.length !== 3) {
            throw new Error('Connectors names MUST be exactly 3 letters');
        }

        return {
            class: require("./connectors/" + item.file).default,
            params: item.params,
            name: item.name
        };

    });

if (config.httpProxy) {
    const HttpsProxyAgent = require("https-proxy-agent");
    vector.agent = new HttpsProxyAgent(url.parse(config.httpProxy));
}

vector.storage = new Storage({}, config);
vector.config = config;
vector.logger = wlogger;
vector.pubSub = new PubSub();
vector.rpki = new RpkiUtils(vector);

module.exports = vector;
