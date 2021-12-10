export default class PubSub {
    constructor() {
        this.callbacks = {};
    };

    subscribe(channel, callback) {
        this.callbacks[channel] = this.callbacks[channel] || [];
        this.callbacks[channel].push(callback);
    };

    publish(channel, content) {
        for (let clb of this.callbacks[channel] || []) {
            new Promise(function(resolve, reject){
                clb(content, channel);
                resolve(true);
            })
                .catch(console.log);
        }
    };

}