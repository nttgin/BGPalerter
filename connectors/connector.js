
export default class Connector {

    constructor(name, params, env){
        this.config = env.config;
        this.logger = env.logger;
        this.pubSub = env.pubSub;
        this.params = params;
        this.name = name;
        this.messageCallback = null;
        this.connectCallback = null;
        this.errorCallback = null;
        this.closeCallback = null;
    }

    connect = () =>
        new Promise((resolve, reject) => reject(new Error('The method connect MUST be implemented')));


    error = (error) => {
        this.logger.log({
            level: 'error',
            message: error
        });
    };

    subscribe = (input) => {
        throw new Error('The method subscribe MUST be implemented');
    };

    message = (message) => {
        if (this.messageCallback)
        this.messageCallback(message);
    };

    connected = (message) => {
        if (this.connectCallback)
            this.connectCallback(message);
    };

    static transform = (message) => {
        throw new Error('The method transform (STATIC) MUST be implemented');
    };

    onConnect = (callback) => {
        this.connectCallback = callback;
    };

    onMessage = (callback) => {
        this.messageCallback = callback;
    };

    onError = (callback) => {
        this.closeCallback = callback;
    };

}