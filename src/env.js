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

import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import PubSub from './utils/pubSub';
import FileLogger from './utils/fileLogger';
import Input from "./inputs/inputYml";
import {version} from '../package.json';
import axios from 'axios';
import url from 'url';

const vector = {
    version: global.EXTERNAL_VERSION_FOR_TEST || version,
    configFile: global.EXTERNAL_CONFIG_FILE ||
        ((global.EXTERNAL_VOLUME_DIRECTORY)
            ? global.EXTERNAL_VOLUME_DIRECTORY + 'config.yml'
            : path.resolve(process.cwd(), 'config.yml')),
    clientId: Buffer.from("bnR0LWJncGFsZXJ0ZXI=", 'base64').toString('ascii')
};

let config = {
    environment: "production",
    connectors: [
        {
            file: "connectorRIS",
            name: "ris",
            params: {
                carefulSubscription: true,
                url: "ws://ris-live.ripe.net/v1/ws/",
                perMessageDeflate: true,
                subscription: {
                    moreSpecific: true,
                    type: "UPDATE",
                    host: null,
                    socketOptions: {
                        includeRaw: false
                    }
                }
            }
        }
    ],
    monitors: [
        {
            file: "monitorHijack",
            channel: "hijack",
            name: "basic-hijack-detection",
            params: {
                thresholdMinPeers: 2
            }
        },
        {
            file: "monitorPath",
            channel: "path",
            name: "path-matching",
            params: {
                thresholdMinPeers: 0
            }
        },
        {
            file: "monitorNewPrefix",
            channel: "newprefix",
            name: "prefix-detection",
            params: {
                thresholdMinPeers: 2
            }
        },
        {
            file: "monitorVisibility",
            channel: "visibility",
            name: "withdrawal-detection",
            params: {
                thresholdMinPeers: 20
            }
        },
        {
            file: "monitorAS",
            channel: "misconfiguration",
            name: "as-monitor",
            params: {
                thresholdMinPeers: 2
            }
        },
        {
            file: "monitorRPKI",
            channel: "rpki",
            name: "rpki-monitor",
            params: {
                preCacheROAs: true,
                refreshVrpListMinutes: 15,
                thresholdMinPeers: 1,
                checkUncovered: false
            }
        }
    ],
    reports: [
        {
            file: "reportFile",
            channels: ["hijack", "newprefix", "visibility", "path", "misconfiguration", "rpki"]
        }
    ],
    notificationIntervalSeconds: 14400,
    alarmOnlyOnce: false,
    monitoredPrefixesFiles: ["prefixes.yml"],
    persistStatus: true,
    logging: {
        directory: "logs",
        logRotatePattern: "YYYY-MM-DD",
        backlogSize: 1000,
        maxRetainedFiles: 10,
        maxFileSizeMB: 15,
        compressOnRotation: false,
    },
    checkForUpdatesAtBoot: true,
    pidFile: "bgpalerter.pid",
    fadeOffSeconds: 360,
    checkFadeOffGroupsSeconds: 30
};

const ymlBasicConfig = yaml.dump(config);

if (fs.existsSync(vector.configFile)) {
    try {
        config = yaml.safeLoad(fs.readFileSync(vector.configFile, 'utf8')) || config;
    } catch (error) {
        throw new Error("The file " + vector.configFile + " is not valid yml: " + error.message.split(":")[0]);
    }
} else {
    console.log("Impossible to load config.yml. A default configuration file has been generated.");

    axios({
        url: 'https://raw.githubusercontent.com/nttgin/BGPalerter/master/config.yml.example',
        method: 'GET',
        responseType: 'blob', // important
    })
        .then((response) => {
            fs.writeFileSync(vector.configFile, response.data);
            yaml.safeLoad(fs.readFileSync(vector.configFile, 'utf8')); // Test readability and format
        })
        .catch(() => {
            fs.writeFileSync(vector.configFile, ymlBasicConfig); // Download failed, write simple default config
        })
}

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

const errorTransport = new FileLogger({
    logRotatePattern: config.logging.logRotatePattern,
    filename: 'error-%DATE%.log',
    directory: config.volume + config.logging.directory,
    backlogSize: config.logging.backlogSize,
    maxRetainedFiles: config.logging.maxRetainedFiles,
    maxFileSizeMB: config.logging.maxFileSizeMB,
    compressOnRotation: config.logging.compressOnRotation,
    label: config.environment,
    format: ({data, timestamp}) => `${timestamp} ${data.level}: ${data.message}`
});

const verboseTransport = new FileLogger({
    logRotatePattern: config.logging.logRotatePattern,
    filename: 'reports-%DATE%.log',
    directory: config.volume + config.logging.directory,
    backlogSize: config.logging.backlogSize,
    maxRetainedFiles: config.logging.maxRetainedFiles,
    maxFileSizeMB: config.logging.maxFileSizeMB,
    compressOnRotation: config.logging.compressOnRotation,
    label: config.environment,
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
            class: require("./reports/" + item.file).default,
            channels: [...item.channels, "software-update"],
            params: item.params
        };

    });
config.connectors = config.connectors || [];

config.connectors.push(        {
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

if (!!config.persistStatus) {
    const Storage = require("./utils/storages/storageFile").default;
    vector.storage = new Storage({
        validitySeconds: config.notificationIntervalSeconds,
    }, config);
}

const input = new Input(config);

vector.config = config;
vector.logger = wlogger;
vector.input = input;
vector.pubSub = new PubSub();

module.exports = vector;
