import { config, logger } from "./env";
import winston from 'winston';

require('winston-daily-rotate-file');

const { combine, timestamp, label, printf } = winston.format;

const environment = "dev"; // Get the real one later

const formatLine = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const verboseFilter  = winston.format((info, opts) => {
    return info.level === 'verbose' ? info : false
});


const transportError = new (winston.transports.DailyRotateFile)({
    filename: config.logging.directory + '/error-%DATE%.log',
    datePattern: config.logging.logRotatePattern,
    zippedArchive: config.logging.zippedArchive,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    level: 'error',
    timestamp: true,
    eol: '\n',
    json: false,
    format: combine(
        label({ label: environment}),
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
        label({ label: environment}),
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

if (environment === 'prod') {
    logger.remove(logger.transports.Console);
}
module.exports = logger;
