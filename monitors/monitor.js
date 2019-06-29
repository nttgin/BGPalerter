
export default class Monitor {

    constructor(inputManager, name, channel, config, pubSub) {
        this.config = config;
        this.pubSub = pubSub;
        this.input = inputManager;
        this.name = name;
        this.channel = channel;
        this.monitored = [];
        this.alerts = {};
        this.sent = {};
        this.updateMonitoredPrefixes();
        setInterval(this._publish, this.config.checkStaleNotificationsSeconds * 1000)
    };

    updateMonitoredPrefixes = () => {
        this.monitored = this.input.getMonitoredPrefixes();
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {
            reject("You must implement a monitor method");
        });

    filter = (message) => {
        throw new Error('The method filter must be implemented in ' + this.name);
    };

    squashAlerts = (alerts) => {
        throw new Error('The method squashAlerts must be implemented in ' + this.name);
    };

    _squash = (alerts) => {

        const firstAlert = alerts[0];
        const id = firstAlert.id;
        let earliest = Infinity;
        let latest = -Infinity;

        for (let alert of alerts){

            earliest = Math.min(alert.timestamp, earliest);
            latest = Math.max(alert.timestamp, latest);

            if (id !== alert.id) {
                throw new Error('Squash MUST receive a list of events all with the same ID.');
            }

        }

        return {
            id,
            origin: this.name,
            earliest,
            latest,
            affected: firstAlert.affected,
            message: this.squashAlerts(alerts),
            data: alerts.map(a => {
                return Object.assign(a.data, {
                    timestamp: a.timestamp
                });
            })
        }

    };

    publishAlert = (id, message, affected, data) => {

        const context = {
            id,
            timestamp: new Date().getTime(),
            message,
            affected,
            data
        };

        if (!this.alerts[id]) {
            this.alerts[id] = [];
        }

        this.alerts[id].push(context);

        if (!this.sent[id]) {
            this._publish();
        }
    };

    _clean = (group) => {

        if (new Date().getTime() > group.latest + (this.config.clearNotificationQueueAfterSeconds * 1000)) {
            delete this.alerts[group.id];
            delete this.sent[group.id];

            return true;
        }

        return false;
    };

    _checkLastSent = (group) => {
        const lastTimeSent = this.sent[group.id];

        if (lastTimeSent) {

            const isThereSomethingNew = lastTimeSent < group.latest;
            const isItTimeToSend = new Date().getTime() > lastTimeSent + (this.config.notificationIntervalSeconds * 1000);

            return isThereSomethingNew && isItTimeToSend;
        } else {
            return true;
        }
    };

    _publish = () => {

        for (let id in this.alerts) {
            const group = this._squash(this.alerts[id]);

            if (this._checkLastSent(group)) {
                this.sent[group.id] = new Date().getTime();
                this._publishOnChannel(group);
            }

            this._clean(group);
        }

    };

    _publishOnChannel = (alert) => {

        this.pubSub.publish(this.channel, alert);

        return alert;
    }

}