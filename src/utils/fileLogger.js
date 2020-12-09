import moment from "moment";
import rotatingLogStream from "file-stream-rotator";
import zlib from 'zlib';
import fs from 'fs';

export default class FileLogger {

    constructor(params) {
        this.format = params.format || this.defaultFormat;
        this.logRotatePattern = params.logRotatePattern || "YYYY-MM-DD";
        this.filename = params.filename;
        this.symLinkName = params.symLink;
        this.useUTC = params.useUTC;
        this.directory = params.directory;
        this.levels = params.levels || ['error', 'info', 'verbose'];

        // File rotation
        this.compressOnRotation = params.compressOnRotation;
        this.maxFileSizeMB = parseFloat(params.maxFileSizeMB  || 20);
        this.maxRetainedFiles = parseFloat(params.maxRetainedFiles  || 20);

        if (!fs.existsSync(this.directory)){
            fs.mkdirSync(this.directory);
        }

        const streamOptions = {
            filename: `${this.directory}/${this.filename}`,
            size: `${this.maxFileSizeMB}m`,
            frequency: "custom",
            end_stream: true,
            max_logs: this.maxRetainedFiles,
            date_format: this.logRotatePattern,
            utc: this.useUTC,
            create_symlink: true,
            symlink_name: this.symLinkName,
            verbose: false,
            audit_file: `${this.directory}/.${this.symLinkName.replace(".log", "")}`
        };

        this.stream = rotatingLogStream.getStream(streamOptions);

        if (this.compressOnRotation) {
            this.stream.on('rotate', (oldFile, newFile) => {
                try {
                    const tmpFile = newFile + ".tmp";
                    const zip = zlib.createGzip();
                    const read = fs.createReadStream(newFile);
                    const write = fs.createWriteStream(tmpFile);
                    read.pipe(zip).pipe(write);
                    write.on('finish', () => {
                        fs.unlinkSync(newFile);
                        fs.renameSync(tmpFile, newFile);
                    });
                } catch (error) {
                    console.log(error); // Nothing else we can do
                }
            })
        }

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
        try {
            const item = this.format({
                timestamp: this.getCurrentDate().format('YYYY-MM-DDTHH:mm:ssZ'),
                data
            });
            this.stream.write(item + "\n");
        } catch (error) {
            console.log(data);
            console.log(error);
        }
    };
};