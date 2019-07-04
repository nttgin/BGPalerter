
export default class Connector {

    constructor(params, env){
        this.config = env.config;
        this.logger = env.logger;
        this.params = params;
        this.messageCallback = null;
        this.connectCallback = null;
        this.errorCallback = null;
        this.closeCallback = null;
    }

    connect = () =>
        new Promise((resolve, reject) => reject(new Error('The method connect has to be implemented')));


    error = () => {
        this.logger.log({
            level: 'info',
            message: 'Web socket disconnected'
        });
    };

    subscribe = (input) => {
        throw new Error('The method subscribe has to be implemented');
    };

    message = (message) => {
        if (this.messageCallback)
        this.messageCallback(message);
    };

    connected = (message) => {
        if (this.connectCallback)
            this.connectCallback(message);
    };

    transform = (message) => {
        throw new Error('The method transform has to be implemented');
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