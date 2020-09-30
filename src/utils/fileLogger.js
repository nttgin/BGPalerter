import fs from "fs";
import moment from "moment";
import { createStream } from "rotating-file-stream";

export default class FileLogger {

    constructor(params) {
        this.format = params.format || this.defaultFormat;
        this.logRotatePattern = params.logRotatePattern || "YYYY-MM-DD";
        this.filename = params.filename;
        this.useUTC = params.useUTC;
        this.directory = params.directory;
        this.levels = params.levels || ['error', 'info', 'verbose'];

        // File rotation
        this.compressOnRotation = params.compressOnRotation;
        this.maxFileSizeMB = parseFloat(params.maxFileSizeMB  || 20);
        this.maxRetainedFiles = parseFloat(params.maxRetainedFiles  || 20);

        this.backlogSize = parseFloat(params.backlogSize || 100);

        if (!fs.existsSync(this.directory)){
            fs.mkdirSync(this.directory);
        }

        const streamOptions = {
            size: `${this.maxFileSizeMB}M`,
            interval: "1d"
        };
        if (this.compressOnRotation) {
            streamOptions.compress = "gzip";
        }
        this.stream = createStream(this.getCurrentFile, streamOptions);
    };

    getCurrentFile = (time, index) => {
        let suffix = "";
        if (index >= 1) {
            suffix = `.${index}`;
            if (this.compressOnRotation) {
                suffix += ".gz";
            }
        }

        return `${this.directory}/${this.filename.replace("%DATE%", this.getCurrentDate().format(this.logRotatePattern))}${suffix}`;
    };

    defaultFormat = (json) => {
        return JSON.stringify(json);
    };

    getCurrentDate = () => {
        if (this.useUTC) {
            return moment.utc();
        } else {
            return moment();
        }
    };

    log = (data) => {

        const item = this.format({
            timestamp: this.getCurrentDate().format('YYYY-MM-DDTHH:mm:ssZ'),
            data
        });

        this.stream.write(item + "\n");
    };
};