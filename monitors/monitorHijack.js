import Monitor from "./monitor";

export default class MonitorHijack extends Monitor {

    constructor(name, channel){
        super(name, channel);
    };

    monitor = (message) => {
        console.log(message);

    };

}