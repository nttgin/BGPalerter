
export default class Report {

    constructor(channels, config, pubSub) {

        this.config = config;
        for (let channel of channels){
            pubSub.subscribe(channel, (message, content) => {
                this.report(message, content);
            });
        }
    }

    report = (message, content) => {
        throw new Error('The method report must be implemented');
    }
}