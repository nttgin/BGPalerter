export default class PubSub{
    constructor() {
        this.callbacks = {};
    };

    subscribe(channel, callback) {
        this.callbacks[channel] = this.callbacks[channel] || [];
        this.callbacks[channel].push(callback);
    };

    publish(channel, content) {
        const callbacks = this.callbacks[channel];
        for (let clb of callbacks) {
            new Promise(function(resolve, reject){
                clb(channel, content);
                resolve(true);
            })
                .catch(console.log);
        }
    };

}