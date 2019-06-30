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
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
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
    filename: 'logs/reports-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
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
