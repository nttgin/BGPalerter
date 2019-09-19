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
import pubSub from 'pubsub-js';
import winston from 'winston';
import Input from "./inputs/inputYml";
require('winston-daily-rotate-file');
const { combine, timestamp, label, printf } = winston.format;

const defaultConfigFilePath = path.resolve(process.cwd(), 'config.yml');
const vector = {
    version: process.env.npm_package_version,
    configFile: global.EXTERNAL_CONFIG_FILE || defaultConfigFilePath
};
let config = {
    environment: "production",
    connectors: [
        {
            file: "connectorRIS",
            name: "ris",
            params: {
                carefulSubscription: true,
                url: "wss://ris-live.ripe.net/v1/ws/",
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
        },
        {
            file: "monitorNewPrefix",
            channel: "newprefix",
            name: "prefix-detection",
        },
        {
            file: "monitorVisibility",
            channel: "visibility",
            name: "withdrawal-detection",
            params: {
                threshold: 10
            }
        }
    ],
    reports: [
        {
            file: "reportFile",
            channels: ["hijack", "newprefix", "visibility"]
        }
    ],
    checkStaleNotificationsSeconds : 60,
    notificationIntervalSeconds: 1800,
    clearNotificationQueueAfterSeconds: 1900,
    monitoredPrefixesFiles: ["prefixes.yml"],
    logging: {
        directory: "logs",
        logRotatePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
    },
    checkForUpdatesAtBoot: true
};

try {
    config = yaml.safeLoad(fs.readFileSync(vector.configFile, 'utf8')) || config;
} catch(e) {
    console.log("Impossible to load config.yml. A default configuration file has been generated.");
    fs.writeFileSync(defaultConfigFilePath, yaml.dump(config))

}

const formatLine = printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`);
const verboseFilter  = winston.format((info, opts) => info.level === 'verbose' ? info : false);
const transportError = new (winston.transports.DailyRotateFile)({
    filename: config.logging.directory  +'/error-%DATE%.log',
    datePattern: config.logging.logRotatePattern,
    zippedArchive: config.logging.zippedArchive,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    level: 'info',
    timestamp: true,
    eol: '\n',
    json: false,
    format: combine(
        label({ label: config.environment}),
        timestamp(),
        formatLine
    )
});

const transportReports = new (winston.transports.DailyRotateFile)({
    filename: config.logging.directory + '/reports-%DATE%.log',
    datePattern: config.logging.logRotatePattern,
    zippedArchive: config.logging.zippedArchive,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    level: 'verbose',
    timestamp: true,
    eol: '\n',
    json: false,
    format: combine(
        verboseFilter(),
        label({ label: config.environment}),
        timestamp(),
        formatLine
    )
});

const winstonTransports = [
    transportError,
    transportReports
];

if (config.environment !== 'production') {
    const consoleTransport = new winston.transports.Console({
        format: winston.format.simple()
    });
    winstonTransports.push(consoleTransport);
}

const wlogger = winston.createLogger({ transports: winstonTransports });

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


const input = new Input(config);

vector.config = config;
vector.logger = wlogger;
vector.input = input;
vector.pubSub = pubSub;

module.exports = vector;