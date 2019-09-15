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

var chai = require("chai");
var chaiSubset = require('chai-subset');
var readLastLines = require('read-last-lines');
var moment = require('moment');
var model = require('../model');
const resetCache = require('resnap')();
chai.use(chaiSubset);
var expect = chai.expect;
var AS = model.AS;

describe("Tests", function() {
    beforeEach(resetCache);

    describe("Configuration loader", function () {
        global.EXTERNAL_CONFIG_FILE = "tests/config.test.yml";
        var env = require("../env");

        it("config structure", function () {
            expect(env.config).to.have
                .keys([
                    "environment",
                    "connectors",
                    "monitors",
                    "reports",
                    "checkStaleNotificationsSeconds",
                    "notificationIntervalSeconds",
                    "clearNotificationQueueAfterSeconds",
                    "monitoredPrefixesFiles",
                    "logging"
                ]);
            expect(env.config.connectors[0]).to.have
                .property('class')
        });

        it("loading connectors", function () {
            expect(env.config.connectors[0]).to
                .containSubset({
                    "params": {"testType": "withdrawal"},
                    "name": "tes"
                });
            expect(env.config.connectors[0]).to.have
                .property('class')
        });


        it("loading monitors", function () {
            expect(env.config.monitors[0]).to
                .containSubset({
                    "channel": "hijack",
                    "name": "basic-hijack-detection",
                    "params": undefined
                });

            expect(env.config.monitors[1]).to
                .containSubset({
                    "channel": "newprefix",
                    "name": "prefix-detection",
                    "params": undefined
                });

            expect(env.config.monitors[2]).to
                .containSubset({
                    "channel": "visibility",
                    "name": "withdrawal-detection",
                    "params": {
                        "threshold": 4
                    }
                });

            expect(env.config.monitors[0]).to.have
                .property('class')
        });

        it("loading reports", function () {
            expect(env.config.reports[0]).to
                .containSubset({
                    "channels": [
                        "hijack",
                        "newprefix",
                        "visibility"
                    ],
                    "params": undefined
                });

            expect(env.config.reports[0]).to.have
                .property('class')
        });

    });


    describe("Input loader", function () {
        process.argv[2] = "tests/config.test.yml";
        var env = require("../env");


        it("loading prefixes", function () {

            expect(env.input.prefixes.length).to.equal(6);
            expect(JSON.parse(JSON.stringify(env.input))).to
                .containSubset({
                    "prefixes": [
                        {
                            "asn": [15562],
                            "description": "description 1",
                            "ignoreMorespecifics": false,
                            "prefix": "165.254.225.0/24",
                            "user": "default"
                        },
                        {
                            "asn": [15562],
                            "description": "description 2",
                            "ignoreMorespecifics": false,
                            "prefix": "165.254.255.0/24",
                            "user": "default",
                        },
                        {
                            "asn": [15562],
                            "description": "description 3",
                            "ignoreMorespecifics": true,
                            "prefix": "192.147.168.0/24",
                            "user": "default",
                        },
                        {
                            "asn": [204092, 45],
                            "description": "alarig fix test",
                            "ignoreMorespecifics": false,
                            "prefix": "2a00:5884::/32",
                            "user": "default"
                        },
                        {
                            "asn": [208585],
                            "description": "alarig fix test 2",
                            "ignoreMorespecifics": false,
                            "prefix": "2a0e:f40::/29",
                            "user": "default"
                        },
                        {
                            "asn": [1234],
                            "description": "ignore sub test",
                            "ignoreMorespecifics": true,
                            "prefix": "2a0e:f40::/30",
                            "user": "default"
                        }

                    ]
                });

        });

    });


    describe("Logging", function () {
        process.argv[2] = "tests/config.test.yml";
        var env = require("../env");

        it("errors logging on the right file", function (done) {
            const message = "Test message";
            env.logger
                .log({
                    level: "error",
                    message: message
                });

            const file = env.config.logging.directory + "/error-" + moment().format('YYYY-MM-DD') + ".log";
            readLastLines
                .read(file, 1)
                .then((line) => {
                    const lineMessage = line.split(" ").slice(3, 5).join(" ").trim();

                    expect(lineMessage).to
                        .equal(message);
                    done();
                });

        });

        it("reports logging on the right file", function (done) {
            const message = "Test message";
            env.logger
                .log({
                    level: "verbose",
                    message: message
                });

            const file = env.config.logging.directory + "/reports-" + moment().format('YYYY-MM-DD') + ".log";
            readLastLines
                .read(file, 1)
                .then((line) => {
                    const lineMessage = line.split(" ").slice(3, 5).join(" ").trim();
                    expect(lineMessage).to.equal(message);
                    done();
                });


        });

    });

    describe("Alerting", function () {
        process.argv[2] = "tests/config.test.yml";
        var pubSub = require("../index");
        var env = require("../env");

        it("visibility reporting", function(done) {

            pubSub.publish("test-type", "visibility");

            const expectedData = {
                "165.254.225.0/24": {
                    id: '165.254.225.0/24',
                    origin: 'withdrawal-detection',
                    affected: 15562,
                    message: 'The prefix 165.254.225.0/24 (description 1) has been withdrawn. It is no longer visible from 4 peers.'
                },
                "2a00:5884::/32": {
                    id: '2a00:5884::/32',
                    origin: 'withdrawal-detection',
                    affected: "204092-45",
                    message: 'The prefix 2a00:5884::/32 (alarig fix test) has been withdrawn. It is no longer visible from 4 peers.'
                }
            };

            pubSub.subscribe("visibility", function (type, message) {

                message = JSON.parse(JSON.stringify(message));

                const id = message.id;

                expect(Object.keys(expectedData).includes(id)).to.equal(true);
                expect(expectedData[id] != null).to.equal(true);


                expect(message).to
                    .containSubset(expectedData[id]);

                expect(message).to.contain
                    .keys([
                        "latest",
                        "earliest"
                    ]);

                delete expectedData[id];
                if (Object.keys(expectedData).length === 0){
                    done();
                }

            });

        }).timeout(10000);



        it("hijack reporting", function(done) {

            pubSub.publish("test-type", "hijack");

            const expectedData = {
                "15562-4-165.254.255.0/25": {
                    id: '15562-4-165.254.255.0/25',
                    origin: 'basic-hijack-detection',
                    affected: 15562,
                    message: 'A new prefix 165.254.255.0/25 is announced by AS4, and AS15562. It should be instead 165.254.255.0/24 (description 2) announced by AS15562',
                    data: [
                        {
                            extra: {},
                            matchedRule: {
                                prefix: "165.254.255.0/24",
                                user: "default",
                                description: "description 2",
                                asn: [15562],
                                ignoreMorespecifics: false
                            },
                            matchedMessage: {
                                type: "announcement",
                                prefix: "165.254.255.0/25",
                                peer: "124.0.0.2",
                                path: [1, 2, 3, [4, 15562]],
                                originAS: [4],
                                nextHop: "124.0.0.2"
                            }
                        }
                    ]
                },
                "208585-2a00:5884:ffff:/48": {
                    id: '208585-2a00:5884:ffff:/48',
                    origin: 'basic-hijack-detection',
                    affected: "204092-45",
                    message: 'A new prefix 2a00:5884:ffff:/48 is announced by AS208585. It should be instead 2a00:5884::/32 (alarig fix test) announced by AS204092, and AS45',
                    data: [
                        {
                            extra: {},
                            matchedRule:{
                                prefix:"2a00:5884::/32",
                                user:"default",
                                description:"alarig fix test",
                                asn:[204092, 45],
                                ignoreMorespecifics:false
                            },
                            matchedMessage: {
                                type: "announcement",
                                prefix: "2a00:5884:ffff:/48",
                                peer: "124.0.0.3",
                                path: [1, 2, 3, 208585],
                                originAS: [208585],
                                nextHop: "124.0.0.3"
                            }
                        }
                    ]
                },
                "15563-2a00:5884::/32": {
                    id: '15563-2a00:5884::/32',
                    origin: 'basic-hijack-detection',
                    affected: "204092-45",
                    message: 'The prefix 2a00:5884::/32 (alarig fix test) is announced by AS15563 instead of AS204092, and AS45',
                    data: [
                        {
                            extra: {},
                            matchedRule:{
                                prefix: "2a00:5884::/32",
                                user: "default",
                                description: "alarig fix test",
                                asn:[204092, 45],
                                ignoreMorespecifics: false
                            },
                            matchedMessage: {
                                type: "announcement",
                                prefix: "2a00:5884::/32",
                                peer:"124.0.0.3",
                                path:[1,2,3,15563],
                                originAS: [15563],
                                nextHop:"124.0.0.3"
                            }
                        }
                    ]
                }

            };

            pubSub.subscribe("hijack", function (type, message) {

                message = JSON.parse(JSON.stringify(message));

                const id = message.id;

                expect(Object.keys(expectedData).includes(id)).to.equal(true);
                expect(expectedData[id] != null).to.equal(true);


                expect(message).to
                    .containSubset(expectedData[id]);

                expect(message).to.contain
                    .keys([
                        "latest",
                        "earliest"
                    ]);

                delete expectedData[id];
                if (Object.keys(expectedData).length === 0){
                    done();
                }

            });

        }).timeout(10000);


        it("newprefix reporting", function (done) {

            pubSub.publish("test-type", "newprefix");

            const expectedData = {
                "15562-165.254.255.0/25":
                    {
                        id: '15562-165.254.255.0/25',
                        origin: 'prefix-detection',
                        affected: 15562,
                        message: 'Possible change of configuration. A new prefix 165.254.255.0/25 is announced by AS15562. It is a more specific of 165.254.255.0/24 (description 2).',
                        data: [
                            {
                                extra: {},
                                matchedRule: {
                                    prefix: '165.254.255.0/24',
                                    user: 'default',
                                    description: 'description 2',
                                    asn: [15562],
                                    ignoreMorespecifics: false
                                },
                                matchedMessage: {
                                    type: 'announcement',
                                    prefix: '165.254.255.0/25',
                                    peer: '124.0.0.2',
                                    path: [ 1, 2, 3, 15562 ],
                                    originAS: [15562],
                                    nextHop: '124.0.0.2'
                                }
                            }
                        ]
                    },
                "204092-2a00:5884:ffff:/48": {
                    id: '204092-2a00:5884:ffff:/48',
                    origin: 'prefix-detection',
                    affected: "204092-45",
                    message: 'Possible change of configuration. A new prefix 2a00:5884:ffff:/48 is announced by AS204092. It is a more specific of 2a00:5884::/32 (alarig fix test).',
                    data: [
                        {
                            extra: {},
                            matchedRule: {
                                prefix: '2a00:5884::/32',
                                user: 'default',
                                description: 'alarig fix test',
                                asn: [ 204092, 45],
                                ignoreMorespecifics: false
                            },
                            matchedMessage: {
                                type: 'announcement',
                                prefix: '2a00:5884:ffff:/48',
                                peer: '124.0.0.3',
                                path: [ 1, 2, 3, 204092 ],
                                originAS: [204092],
                                nextHop: '124.0.0.3'
                            }
                        }
                    ]
                }

            };

            pubSub.subscribe("newprefix", function (type, message) {

                message = JSON.parse(JSON.stringify(message));

                const id = message.id;

                expect(Object.keys(expectedData).includes(id)).to.equal(true);
                expect(expectedData[id] != null).to.equal(true);


                expect(message).to
                    .containSubset(expectedData[id]);

                expect(message).to.contain
                    .keys([
                        "latest",
                        "earliest"
                    ]);

                delete expectedData[id];
                if (Object.keys(expectedData).length === 0){
                    done();
                    setTimeout(function () {
                        process.exit()
                    }, 20000);
                }

            });



        }).timeout(10000);

    });

});