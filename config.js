import MonitorHijack from "./monitors/monitorHijack";

module.exports = {
    bufferSize: 10,
    wsParams: {
        moreSpecific: false,
        type: "UPDATE",
        // host: "rrc21",
        socketOptions: {
            includeRaw: false
        }
    },

    monitors: [
        MonitorHijack
    ]
};