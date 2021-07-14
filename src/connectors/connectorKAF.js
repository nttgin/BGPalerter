/*
 * 	BSD 3-Clause License
 *
 * Copyright (c) 2019, NTT Ltd.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import Connector from "./connector";
import { AS, Path } from "../model";
import brembo, { parse } from "brembo";
import ipUtils from "ip-sub";

export default class ConnectorKAF extends Connector {

    constructor(name, params, env) {
        super(name, params, env);
        this.consumer = null;
        this.subscription = null;
        this.agent = env.agent;
        this.subscribed = {};

        this.url = brembo.build(this.params.url, {
            path: [],
            params: {
                client: env.clientId
            }
        });
    };

    _openConnect = (resolve) => {
        resolve(true);

        this._connect(this.name + ' connector connected');        

        if (this.subscription) {
            this.subscribe(this.subscription);
        }
    };

    _messageToJson = (message) => {
        this._message(JSON.parse(message));
    };

    _appendListeners = (resolve, reject) => {
        this.consumer.on('message', (message) => {
            this._message(message);
            //console.log(message);
        });
        this.consumer.on('error', (error) => {
            console.log("There was an error, disconnecting from broker")
            if (this.connected) {
                this._disconnect("RIPE RIS disconnected");
            } else {
                this._disconnect("It was not possible to establish a connection with RIPE RIS");
                reject();
            }
            console.error(error);
            this._error
        });
        this.consumer.on('connect', () => {
            this._openConnect(resolve);
        });
    };

    connect = () =>
        new Promise((resolve, reject) => {
            try {
                var kafka = require('kafka-node');
                var consumerOptions = {
                    kafkaHost: this.params.broker,
                    groupId: this.params.groupId,
                    sessionTimeout: 15000,
                    protocol: ['roundrobin'],
                    fromOffset: 'latest'
                }
                //console.log(consumerOptions);
                var topic = [this.params.topic];

                var consumerGroup = new kafka.ConsumerGroup(Object.assign({ id: 'BGPAlerter' }, consumerOptions), topic);
                this.consumer = consumerGroup;
                this._appendListeners(resolve, reject);


            } catch(error) {
                this._error(error);
                console.log(error);
                reject(error);
            }
        });

    disconnect = () => {
        if (this.ws) {
            this._disconnect(`${this.name} disconnected`);
        }
    };

    _subscribeToAll = (input) => {
        //this.ws.send(JSON.stringify({
        //    type: "ris_subscribe",
        //    data: this.params.subscription
        //}));
    };

    _optimizedPathMatch = (regex) => {

        if (regex) {
            regex = (regex.slice(0,2) === ".*") ? regex.slice(2) : regex;
            regex = (regex.slice(-2) === ".*") ? regex.slice(0,-2) : regex;
            const regexTests = [
                "^[\\^]*\\d+[\\$]*$",
                "^[\\^]*[\\d+,]+\\d+[\\$]*$",
                "^[\\^]*\\[[\\d+,]+\\d+\\][\\$]*$"
            ];

            for (let r of regexTests) {
                if (new RegExp(r).test(regex)) {
                    return regex;
                }
            }
        }

        return null;
    };

    _subscribeToPrefixes = (input) => {
        const monitoredPrefixes = input.getMonitoredLessSpecifics();
        const params = JSON.parse(JSON.stringify(this.params.subscription));

        if (monitoredPrefixes
            .filter(
                i => (ipUtils.isEqualPrefix(i.prefix, '0:0:0:0:0:0:0:0/0') || ipUtils.isEqualPrefix(i.prefix,'0.0.0.0/0'))
            ).length === 2) {

            delete params.prefix;

            if (!this.subscribed["everything"]) {
                console.log("Monitoring everything");
                this.subscribed["everything"] = true;
            }

        } else {
            for (let p of monitoredPrefixes) {

                if (!this.subscribed[p.prefix]) {
                    console.log("Monitoring", p.prefix);
                    this.subscribed[p.prefix] = true;
                }

                params.prefix = p.prefix;
            }
        }
    };

    _subscribeToASns = (input) => {
        const monitoredASns = input.getMonitoredASns().map(i => i.asn);
        for (let asn of monitoredASns){
            const asnString = asn.getValue();
            if (!this.subscribed[asnString]) {
                console.log(`Monitoring AS${asnString}`);
                this.subscribed[asnString] = true;
            }
        }
    };

    _onInputChange = (input) => {
        this.connect()
            .then(() => this.subscribe(input))
            .then(() => {
                this.logger.log({
                    level: 'info',
                    message: "Prefix rules reloaded"
                });
            })
            .catch(error => {
                if (error) {
                    this.logger.log({
                        level: 'error',
                        message: error
                    });
                }
            });
    };

    onInputChange = (input) => {
        input.onChange(() => {
            if (this._timeoutFileChange) {
                clearTimeout(this._timeoutFileChange);
            }
            this._timeoutFileChange = setTimeout(() => {
                this._onInputChange(input);
            }, 2000);
        });
    };

    subscribe = (input) =>
        new Promise((resolve, reject) => {
            this.subscription = input;
            try {
                if (this.params.carefulSubscription) {
                    this._subscribeToPrefixes(input);
                    this._subscribeToASns(input);
                } else {
                    this._subscribeToAll(input);
                }

                this.onInputChange(input);

                resolve(true);
            } catch(error) {
                console.log(error);
                this._error(error);
                resolve(false);
            }
        });

    static transform = (message) => {
        try {
            //Pull out the prefixes 
            let announcements = `${message.value}`.split("\n\n")[1].split("\n");
            
            //let announcements = `${message.value}`.split("\n");

            let headers = [ "Action","Sequence","Hash","Router Hash",
                            "Router IP","Base Attr Hash","Peer Hash",
                            "Peer IP","Peer ASN","Timestamp","Prefix",
                            "Length","isIPv4","Origin","AS Path",
                            "AS Path Count","Origin AS","Next Hop",
                            "MED","Local Pref","Aggregator","Community List",
                            "Ext Community List","Cluster List","isAtomicAgg",
                            "isNextHopIPv4","Originator Id","Path ID",
                            "Labels","isPrePolicy","isAdjIn"];

            var parsedAnnouncements = [];
            //console.log(announcements);
            for(var i=0;i<announcements.length-1;i++) {
                var obj = {};
                var announcement = announcements[i].split("\t");
                for(var j=0;j<headers.length;j++){
                    obj[headers[j]] = announcement[j];
                }
                parsedAnnouncements.push(obj);
            };

            const components = [];
            const aggregator = parsedAnnouncements[0]["Aggregator"];
            const peer = parsedAnnouncements[0]["Peer IP"];
            const timestamp = parsedAnnouncements[0]["Timestamp"];
            let path, originAS, communities, nextHop;

            for(var i=0;i<parsedAnnouncements.length;i++){
                if (parsedAnnouncements[i]["Action"] == 'add'){
                    communities = parsedAnnouncements[i]["Community List"] || [];
                    nextHop = parsedAnnouncements[i]["Next Hop"];

                    if (parsedAnnouncements[i]["AS Path"] && parsedAnnouncements[i]["AS Path"].length) {
                        var paths = parsedAnnouncements[i]["AS Path"].split(" ");
                        paths.shift();
                        path = new Path(paths.map(i => new AS(i)));
                        originAS = path.getLast();

                        if (ipUtils.isValidIP(nextHop)) {
                            const prefix = (parsedAnnouncements[i]["Prefix"] + "/" + parsedAnnouncements[i]["Length"] || []);
                            if(ipUtils.isValidPrefix(prefix)){
                                components.push({
                                    type: "announcement",
                                    prefix,
                                    peer,
                                    path,
                                    originAS,
                                    nextHop,
                                    aggregator,
                                    timestamp,
                                    communities
                                });
                            }                      
                        }
                    }
                }
                else if (parsedAnnouncements[i]["Action"] == 'del'){
                    let prefix = parsedAnnouncements[i]["Prefix"];
                    components.push({
                        type: "withdrawal",
                        prefix,
                        peer,
                        timestamp
                    });              
                }
            }
            //console.log(components);
            return components;
        } catch (error) {
            console.log(error);
            throw new Error(`Error during transform (${this.name}): ` + error.message);
        }
        
    }
};
