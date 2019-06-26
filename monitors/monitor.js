import PubSub from 'pubsub-js';
import config from "../config";

export default class Monitor {

    constructor(inputManager, name, channel){
        this.input = inputManager;
        this.name = name;
        this.channel = channel;
        this.monitored = [];
        this.alerts = {};
        this.sent = {};
        this.updateMonitoredPrefixes();
        setTimeout(this._publish, config.checkStaleNotificationsSeconds)
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

            earliest = Math.max(alert.timestamp, earliest);
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
            data: alerts.map(a => a.data)
        }

    };

    publishAlert = (eventId, message, affected, data) => {

        const context = {
            eventId,
            timestamp: new Date(),
            message,
            affected,
            data
        };

        if (!this.alerts[id]) {
            this.alerts[id] = [];
        }

        this.alerts[id].push(context);
    };

    _clean = (group) => {

        if (new Date().getTime() > group.latest + (config.clearNotificationQueueAfterSeconds * 1000)) {
            delete this.alerts[group.id];

            return true;
        }

        return false;
    };

    _checkLastSent = (group) => {

        const lastTimeSent = this.sent[group.id];
        const isThereSomethingNew = lastTimeSent < group.latest;
        const isItTimeToSend = new Date().getTime() > lastTimeSent + (config.notificationIntervalSeconds * 1000);

        return isThereSomethingNew && isItTimeToSend;

    };

    _publish = () => {

        for (let id of this.alerts) {
            const group = this._squash(this.alerts[id]);

            if (this._checkLastSent(group)) {
                this._publishOnChannel(group);
            }

            this._clean(group);
        }

    };

    _publishOnChannel = (alert) => {

        PubSub.publish(this.channel, alert);

        return alert;
    }

}