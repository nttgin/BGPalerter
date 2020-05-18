var fs = require('fs');
var moment = require('moment');
const zlib = require('zlib');

export default class FileLogger {

    constructor(params) {

        this.format = params.format || this.defaultFormat;
        this.logRotatePattern = params.logRotatePattern;
        this.filename = params.filename;
        this.directory = params.directory;
        this.levels = params.levels || ['error', 'info', 'verbose'];

        // File rotation
        this.compressOnRotation = params.compressOnRotation;
        this.maxFileSizeMB = parseFloat(params.maxFileSizeMB  || 20);
        this.maxRetainedFiles = parseFloat(params.maxRetainedFiles  || 20);

        this.backlog = [];
        this.staleTimer = null;
        this.backlogSize = parseFloat(params.backlogSize || 100);

        this.wstream = null;


        if (!fs.existsSync(this.directory)){
            fs.mkdirSync(this.directory);
        }

        this._currentFile = this.getCurrentFile();
    };

    getRotatedFileName = (number) => {
        return this._currentFile + '.' + number + ((this.compressOnRotation) ? '.gz' : '');
    };

    rotateOldFiles = () => {
        for (let n=this.maxRetainedFiles; n >= 0; n--) {
            const fileName = this.getRotatedFileName(n);

            if (fs.existsSync(fileName)) {
                fs.renameSync(fileName, this.getRotatedFileName(n + 1));
            }
        }

    };

    applyFileNumberLimit = () => {

        try {

            let files = fs.readdirSync(this.directory)
                .filter(i => i.indexOf('.log') > 0)
                .sort((file1, file2) => {
                    const v1 = file1.replace('.gz', '').split('.').pop();
                    const v2 = file2.replace('.gz', '').split('.').pop();
                    return parseInt(v1) - parseInt(v2);
                });

            if (files.length >= this.maxRetainedFiles - 1) {
                files = files.slice(this.maxRetainedFiles);
                files
                    .forEach(file => {
                        fs.unlinkSync(this.directory + '/' + file);
                    });
            }
        } catch {
            // Nothing
        }
    };

    hasToBeRotated = () => {
        const stat = fs.statSync(this._currentFile);
        const fileSizeInMegabytes = stat.size / 1000000.0;
        return fileSizeInMegabytes > this.maxFileSizeMB;
    };

    rotate = () => {
        this.close();
        const currentRotatedFile = this.getRotatedFileName(0);
        const firstRotatedFile = this.getRotatedFileName(1);
        fs.renameSync(this._currentFile, currentRotatedFile);

        this.rotateOldFiles();
        if (this.compressOnRotation) {
            fs.writeFileSync(firstRotatedFile, zlib.gzipSync(fs.readFileSync(firstRotatedFile, 'utf8')));
        }

        this.applyFileNumberLimit();
        this.open();
    };

    getCurrentFile = () => {
        return this.directory + '/' + this.filename.replace("%DATE%", moment().format(this.logRotatePattern));
    };

    currentFileChanged = () => {
        const file = this.getCurrentFile();
        return this._currentFile && this._currentFile !== file;
    };

    defaultFormat = (json) => {
        return JSON.stringify(json);
    };

    log = (data) => {

        const item = this.format({
            timestamp: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
            data
        });


        if (this.staleTimer) {
            clearTimeout(this.staleTimer);
            delete this.staleTimer;
        }

        if (this.currentFileChanged()) {
            this.flush();
            this.rotate();

            this.backlog.push(item);

        } else {

            this.backlog.push(item);

            if (this.backlog.length >= this.backlogSize) {
                this.flush();
                if (this.hasToBeRotated()){
                    this.rotate();
                }
            } else {
                this.staleTimer = setTimeout(this.flushAndClose, 1000);
            }
        }



    };

    flushAndClose = () => {
        this.flush();
        this.close();
    };

    flush = () => {
        const string = this.backlog.join('\n') + '\n';
        this.backlog = [];
        if (this.wstream === null) {
            this.open();
        }
        fs.appendFileSync(this.wstream, string, 'utf8');
    };

    open = () => {
        this._currentFile = this.getCurrentFile();
        this.wstream = fs.openSync(this._currentFile, 'a');
    };

    close = () => {
        if (this.wstream !== null)
            fs.closeSync(this.wstream);
        this.wstream = null;
    }

};