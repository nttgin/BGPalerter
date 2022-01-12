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

const { Kafka } = require('kafkajs');
const fs = require('fs');
const {  CompressionTypes, CompressionCodecs } = require('kafkajs')
const SnappyCodec = require('kafkajs-snappy')
export default class ConnectorKAF extends Connector {

    constructor(name, params, env) {
        super(name, params, env);
        this.consumer = null;
        this.subscription = null;

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

    async consumerRunner(resolve, reject) {
        const run = async () => {
            const topic = this.params.topic;
            await this.consumer.connect();
            this._openConnect(resolve);
            await this.consumer.subscribe({ topic, fromBeginning: false });
            await this.consumer.run({
                eachMessage: async ({ message }) => {
                this._message(message);
                },
            })
        }
        
        run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

        const errorTypes = ['unhandledRejection', 'uncaughtException']
        const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`process.on ${type}`)
                    console.error(e)
                    await this.consumer.disconnect()
                    process.exit(0)
                } catch (_) {
                    process.exit(1)
                }
            })
        })

        signalTraps.map(type => {
            process.once(type, async () => {
                try {
                    await this.consumer.disconnect()
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }

    connect = () =>
        new Promise((resolve, reject) => {
            try {
                CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

                //kafka vars
                const kafkaClientId = this.params.clientId;
                const kafkaBrokers = [this.params.broker]
                //const kafkaTopic = this.params.topic;
                const kafkaGroupId = this.params.groupId;

                const kafka = new Kafka({

                    clientId: kafkaClientId,
                    brokers: kafkaBrokers
                    // ssl: {
                    //   rejectUnauthorized: false,
                    //   ca: [fs.readFileSync('./keys/ca.crt', 'utf-8')],
                    //   key: fs.readFileSync('./keys/private.pem', 'utf-8'),
                    //   cert: fs.readFileSync('./keys/public.pem', 'utf-8'),
                    //   honorCipherOrder: true
                    // }
                  })

                  this.consumer = kafka.consumer({ groupId: kafkaGroupId });
                  this.consumerRunner(resolve, reject);


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

    _onInputChange = (input) => {
        this.connect()
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
    //This is not used with kafka but is required by the connector class
        new Promise((resolve, reject) => {
            resolve(true);
        });

    static transform = (message) => {
        try {
            //Pull out the prefixes 
            //let announcements = `${message.value.toString()}`.split("\n\n")[1].split("\n");
            
            let announcements = `${message.value}`.split("\n"); //Used for testing with test producer

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
