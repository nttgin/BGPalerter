
export default class Monitor {

    constructor(name, channel){
        this.name = name;
        this.channel = channel;
    };

    monitor = (message) => {
        throw Error("You must implement a monitor method");
    };

}