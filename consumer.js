import config from "./config";

export default class Consumer {
    constructor(){
        process.on('message', this.dispatch);
        this.monitors = config.monitors.map(monitor => new monitor());
    };

    dispatch = (message) => {
        console.log("ere");
        try {
            message = JSON.parse(message);
            switch (message.type) {
                case "ris_message": this.handleUpdate(message)
            }
        } catch (e) {
            console.log(e);
        }
    };

    handleUpdate = (message) => {
        for (let monitor of this.monitors){
            monitor.monitor(message);
        }
    }

}


