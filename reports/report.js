
export default class Report {

    constructor(channels, params, env) {

        this.config = env.config;
        this.logger = env.logger;
        this.pubSub = env.pubSub;
        this.params = params;

        for (let channel of channels){
            env.pubSub.subscribe(channel, (message, content) => {
                this.report(message, content);
            });
        }
    }

    report = (message, content) => {
        throw new Error('The method report must be implemented');
    }
}