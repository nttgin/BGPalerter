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

import Report from "./report";
import kafka from "kafka-node";

export default class ReportKafka extends Report {

    constructor(channels,params, env) {
        super(channels, params, env);
        this.client = null;
        this.producer = null;
        this.connected = false;
        this.host = this.params.host;
        this.topics = this.params.topics;
        this.connecting = null;
    }

    _getTopic = (channel) => {
        const topic = this.topics[channel] || this.topics['default'];
        if (!topic) {
            this.logger.log({
                level: 'error',
                message: 'No topic available for alert channel: ' + channel
            });
            return false;
        } else {
            return topic;
        }
    };

    _connectToKafka = () => {
        if (!this.connecting) {
            this.connecting = new Promise((resolve, reject) => {
                if (this.connected) {
                    resolve(true);
                } else {
                    this.client = new kafka.KafkaClient({kafkaHost: this.host});
                    this.producer = new kafka.HighLevelProducer(this.client);


                    this.producer.setMaxListeners(0);
                    this.producer
                        .on('ready', () => {
                            this.connected = true;
                            resolve(true);
                        });

                    this.producer
                        .on('error', (error) => {
                            this.logger.log({
                                level: 'error',
                                message: 'Kafka connector error: ' + error
                            });
                        });
                }
            });
        }

        return this.connecting;
    };

    _sendOutcome = (error, data) => {
        this.logger.log({
            level: 'error',
            message: 'Kafka error during send: ' + JSON.stringify(data)
        });
    };

    _getPayload = (topic, channel, message) => {
        return [{
            topic: topic,
            messages: JSON.stringify(message),
            key: channel,
            attributes: 1,
            timestamp: Date.now()
        }];
    };

    report = (channel, content) => {
        return this._connectToKafka()
            .then(() => {
                const topic = this._getTopic(channel);
                this.producer.send(this._getPayload(topic, channel, content), this._sendOutcome);
            })
            .catch(error => {
                this.logger.log({
                    level: 'error',
                    message: 'Kafka disconnected: ' + error
                });
            });
    }
}