export default class LossyBuffer {

    constructor(bufferSize, cleaningInterval, logger) {
        this.callback = null;
        this.buffer = [];
        this.bufferSize = bufferSize;
        setInterval(this.sendData, cleaningInterval);
        this.alertOnce = false;
        this.logger = logger;
    };

    sendData = () => {
        if (this.callback && this.buffer.length) {
            this.callback(this.buffer);
            this.buffer = [];
        }
    };

    add = (item) => {
        if (this.buffer.length <= this.bufferSize) {
            this.buffer.push(item);

        } else if (!this.alertOnce) {
            this.alertOnce = true;
            this.logger.log({
                level: "error",
                message: "The data rate is too high, messages are getting dropped due to full buffer. Increase the buffer size if you think your machine could handle more."
            });
        }

    };

    onData = (callback) => {
        this.callback = callback;
    };

}
