
export default class Input {

    constructor(config){
    };

    getMonitoredMoreSpecifics = () => {
        throw new Error('The method getMonitoredMoreSpecifics MUST be implemented');
    };

    getMonitoredPrefixes = () => {
        throw new Error('The method getMonitoredPrefixes MUST be implemented');
    };

}