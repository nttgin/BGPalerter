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

const chai = require("chai");
const chaiSubset = require("chai-subset");
const asyncTimeout = 60000;
chai.use(chaiSubset);

const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId: "bgpalerter",
    brokers: ["localhost:9092"]
});

global.EXTERNAL_CONFIG_FILE = "tests/kafka_tests/config.kafka.test.yml";

describe("Reports 1", function () {
    const worker = require("../../index");
    const pubSub = worker.pubSub;

    it("kafka", function (done) {
        let doneCalled = false;
        const consumer = kafka.consumer({groupId: "bgpalerter"});
        consumer.connect();
        consumer
            .subscribe({topic: "bgpalerter", fromBeginning: true})
            .then(() => {

                pubSub.publish("test-type", "visibility");
                consumer.run({
                    eachMessage: ({topic, partition, message}) => {
                        if (!doneCalled) {
                            done();
                            doneCalled = true;
                        }
                        return Promise.resolve();
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });

    }).timeout(asyncTimeout);

});