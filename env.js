import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import pubSub from 'pubsub-js';
import winston from 'winston';
import InputManager from "./inputManager";
require('winston-daily-rotate-file');
const { combine, timestamp, label, printf } = winston.format;

const vector = {
    env: "dev" // Get the real one later
};

const config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'config.yml'), 'utf8'));

const formatLine = printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`);
const verboseFilter  = winston.format((info, opts) => info.level === 'verbose' ? info : false);
const transportError = new (winston.transports.DailyRotateFile)({
    filename: 'logs/error-%DATE%.log',
    datePattern: config.logging.logRotatePattern,
    zippedArchive: config.logging.zippedArchive,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    level: 'error',
    timestamp: true,
    eol: '\n',
    json: false,
    format: combine(
        label({ label: vector.env}),
        timestamp(),
        formatLine
    )
});
const transportReports = new (winston.transports.DailyRotateFile)({
    filename: 'logs/reports-%DATE%.log',
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
        label({ label: vector.env}),
        timestamp(),
        formatLine
    )
});

const logger = winston.createLogger({
    level: 'info',
    transports: [
        transportError,
        transportReports
    ]
});

if (vector.env === 'prod') {
    logger.remove(logger.transports.Console);
}

config.monitors = (config.monitors || [])
    .map(item => {
        return {
            class: require("./monitors/" + item.file).default,
            channel: item.channel,
            name: item.name
        };
    });

config.reports = (config.reports || [])
    .map(item => {

        return {
            class: require("./reports/" + item.file).default,
            channels: item.channels
        };

    });

config.connectors = (config.connectors || [])
    .map(item => {

        return {
            class: require("./connectors/" + item.file).default,
            params: item.params
        };

    });

const input = new InputManager(config);

vector.config = config;
vector.logger = logger;
vector.input = input;
vector.pubSub = pubSub;
vector.monitors = config.monitors.map(monitor => new monitor.class(monitor.name, monitor.channel, vector));
vector.reports = config.reports.map(report => new report.class(report.channels, vector));


module.exports = vector;