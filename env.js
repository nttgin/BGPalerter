import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import pubSub from 'pubsub-js';
import winston from 'winston';
import Input from "./inputs/inputYml";
require('winston-daily-rotate-file');

const { combine, timestamp, label, printf } = winston.format;

const vector = {};
const fileName = process.argv[2] || path.resolve(process.cwd(), 'config.yml');
console.log("loading config:", fileName);
const config = yaml.safeLoad(fs.readFileSync(fileName, 'utf8'));


const formatLine = printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`);
const verboseFilter  = winston.format((info, opts) => info.level === 'verbose' ? info : false);
const transportError = new (winston.transports.DailyRotateFile)({
    filename: config.logging.directory  +'/error-%DATE%.log',
    datePattern: config.logging.logRotatePattern,
    zippedArchive: config.logging.zippedArchive,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    level: 'error',
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

const wlogger = winston.createLogger({
    level: 'info',
    transports: [
        transportError,
        transportReports,
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

if (config.environment === 'production') {
    wlogger.remove(wlogger.transports.Console);
}

config.monitors = (config.monitors || [])
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
            channels: item.channels,
            params: item.params
        };

    });
config.connectors = config.connectors || [];

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