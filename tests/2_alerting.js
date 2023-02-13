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
const fs = require("fs");
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
const expect = chai.expect;
const volume = "volumetests/";
const cacheCloneDirectory = "tests/.cache_clone/";
const asyncTimeout = 120000;
global.EXTERNAL_VERSION_FOR_TEST = "0.0.1";
global.EXTERNAL_CONFIG_FILE = volume + "config.test.yml";
const axios = require("axios");

const worker = require("../index");
const pubSub = worker.pubSub;

describe("Alerting", function () {

    it("visibility reporting", function(done) {
        const expectedData = {
            "165.254.225.0/24": {
                id: '165.254.225.0/24',
                origin: 'withdrawal-detection',
                affected: 15562,
                message: 'The prefix 165.254.225.0/24 (description 1) has been withdrawn. It is no longer visible from 4 peers'
            },
            "2a00:5884::/32": {
                id: '2a00:5884::/32',
                origin: 'withdrawal-detection',
                affected: "204092-45",
                message: 'The prefix 2a00:5884::/32 (alarig fix test) has been withdrawn. It is no longer visible from 4 peers'
            },
            "2001:db8:123::/48": {
                id: '2001:db8:123::/48',
                origin: 'withdrawal-detection',
                affected: 65000,
                message: 'The prefix 2001:db8:123::/48 (exact matching test) has been withdrawn. It is no longer visible from 4 peers'
            }
        };

        let visibilityTestCompleted = false;
        pubSub.subscribe("visibility", (message, type) => {
            try {
                if (!visibilityTestCompleted) {
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
                    if (Object.keys(expectedData).length === 0) {
                        setTimeout(() => {
                            visibilityTestCompleted = true;
                            done();
                        }, 5000);
                    }
                }
            } catch (error) {
                visibilityTestCompleted = true;
                done(error);
            }

        });
        pubSub.publish("test-type", "visibility");
    }).timeout(asyncTimeout);

    it("hijack reporting", function(done) {

        const expectedData = {
            "15562-4-165.254.255.0/25": {
                id: '15562-4-165.254.255.0/25',
                origin: 'basic-hijack-detection',
                affected: 15562,
                message: 'A new prefix 165.254.255.0/25 is announced by AS15562, and AS4. It should be instead 165.254.255.0/24 (description 2) announced by AS15562',
                data: [
                    {
                        extra: {},
                        matchedRule: {
                            prefix: "165.254.255.0/24",
                            group: "groupName",
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
            "208585-2a00:5884:ffff::/48": {
                id: '208585-2a00:5884:ffff::/48',
                origin: 'basic-hijack-detection',
                affected: "204092-45",
                message: 'A new prefix 2a00:5884:ffff::/48 is announced by AS208585. It should be instead 2a00:5884::/32 (alarig fix test) announced by AS204092, and AS45',
                data: [
                    {
                        extra: {},
                        matchedRule:{
                            prefix:"2a00:5884::/32",
                            group:"default",
                            description:"alarig fix test",
                            asn:[204092, 45],
                            ignoreMorespecifics:false
                        },
                        matchedMessage: {
                            type: "announcement",
                            prefix: "2a00:5884:ffff::/48",
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
                            group: "default",
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
        let hijackTestCompleted = false
        pubSub.subscribe("hijack", (message, type) => {
            try {
                if (!hijackTestCompleted) {
                    message = JSON.parse(JSON.stringify(message));

                    const id = message.id;

                    expect(Object.keys(expectedData).includes(id)).to.be.true;
                    expect(expectedData[id] != null).to.be.true;
                    expect(message).to.containSubset(expectedData[id]);
                    expect(message).to.contain.keys(["latest", "earliest"]);

                    delete expectedData[id];

                    if (Object.keys(expectedData).length === 0) {
                        setTimeout(() => {
                            hijackTestCompleted = true;
                            done();
                        }, 5000);
                    }
                }
            } catch (error) {
                hijackTestCompleted = true;
                done(error);
            }
        });

        pubSub.publish("test-type", "hijack");

    }).timeout(asyncTimeout);

    it("newprefix reporting", function (done) {

        const expectedData = {
            "1234-175.254.205.0/25": {
                id: '1234-175.254.205.0/25',
                origin: 'prefix-detection',
                affected: 1234,
                message: 'A new prefix 175.254.205.0/25 is announced by AS1234. It is a more specific of 175.254.205.0/24 (include exclude test). Maybe you need to update your BGPalerter prefix list.',
                data: [
                    {
                        extra: {},
                        matchedRule: {
                            prefix: '175.254.205.0/24',
                            group: 'default',
                            description: 'include exclude test',
                            asn: [1234],
                            ignoreMorespecifics: false,
                            ignore: false,
                            excludeMonitors: ["basic-hijack-detection", "withdrawal-detection"]
                        },
                        matchedMessage: {
                            type: 'announcement',
                            prefix: '175.254.205.0/25',
                            peer: '124.0.0.3',
                            path: [ 1, 2, 3, 1234 ],
                            originAS: [1234],
                            nextHop: '124.0.0.3'
                        }
                    }
                ]
            },
            "1234-170.254.205.0/25": {
                id: '1234-170.254.205.0/25',
                origin: 'prefix-detection',
                affected: 1234,
                message: 'A new prefix 170.254.205.0/25 is announced by AS1234. It is a more specific of 170.254.205.0/24 (include exclude test). Maybe you need to update your BGPalerter prefix list.',
                data: [
                    {
                        extra: {},
                        matchedRule: {
                            prefix: '170.254.205.0/24',
                            group: 'default',
                            description: 'include exclude test',
                            asn: [1234],
                            ignoreMorespecifics: false,
                            includeMonitors: ["prefix-detection"],
                            ignore: false
                        },
                        matchedMessage: {
                            type: 'announcement',
                            prefix: '170.254.205.0/25',
                            peer: '124.0.0.3',
                            path: [ 1, 2, 3, 1234 ],
                            originAS: [1234],
                            nextHop: '124.0.0.3'
                        }
                    }
                ]
            },
            "15562-165.254.255.0/25":
                {
                    id: '15562-165.254.255.0/25',
                    origin: 'prefix-detection',
                    affected: 15562,
                    message: 'A new prefix 165.254.255.0/25 is announced by AS15562. It is a more specific of 165.254.255.0/24 (description 2). Maybe you need to update your BGPalerter prefix list.',
                    data: [
                        {
                            extra: {},
                            matchedRule: {
                                prefix: '165.254.255.0/24',
                                group: 'groupName',
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
            "204092-2a00:5884:ffff::/48": {
                id: '204092-2a00:5884:ffff::/48',
                origin: 'prefix-detection',
                affected: "204092-45",
                message: 'A new prefix 2a00:5884:ffff::/48 is announced by AS204092. It is a more specific of 2a00:5884::/32 (alarig fix test). Maybe you need to update your BGPalerter prefix list.',
                data: [
                    {
                        extra: {},
                        matchedRule: {
                            prefix: '2a00:5884::/32',
                            group: 'default',
                            description: 'alarig fix test',
                            asn: [ 204092, 45],
                            ignoreMorespecifics: false
                        },
                        matchedMessage: {
                            type: 'announcement',
                            prefix: '2a00:5884:ffff::/48',
                            peer: '124.0.0.3',
                            path: [ 1, 2, 3, 204092 ],
                            originAS: [204092],
                            nextHop: '124.0.0.3'
                        }
                    }
                ]
            }

        };

        let newprefixTestCompleted = false;
        pubSub.subscribe("newprefix", (message, type) => {
            try {
                if (!newprefixTestCompleted) {
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
                    if (Object.keys(expectedData).length === 0) {
                        setTimeout(() => {
                            newprefixTestCompleted = true;
                            done();
                        }, 5000);
                    }
                }
            } catch (error) {
                newprefixTestCompleted = true;
                done(error);
            }
        });
        pubSub.publish("test-type", "newprefix");
    }).timeout(asyncTimeout);

    it("path match reporting", function (done) {
        const expectedData = {
            "98.5.4.3/22-1": {
                id: '98.5.4.3/22-1',
                origin: 'path-matching',
                affected: "98.5.4.3/22",
                message: 'Matched test description2 on prefix 98.5.4.3/22 (including length violation) 1 times',
                "data":
                    [
                        {

                            "affected": "98.5.4.3/22",
                            "matchedRule": {
                                "prefix": "98.5.4.3/22",
                                "group": "default",
                                "ignore": false,
                                "excludeMonitors": [],
                                "includeMonitors": [],
                                "description": "path matching test regex and maxLength",
                                "asn": [2914],
                                "ignoreMorespecifics": false,
                                "path": [
                                    {
                                        "match": ".*2915$",
                                        "maxLength": 4,
                                        "matchDescription": "test description1"
                                    }, {
                                        "match": ".*2914$",
                                        "maxLength": 3,
                                        "matchDescription": "test description2"
                                    }
                                ]
                            }, "matchedMessage": {
                                "type": "announcement",
                                "prefix": "98.5.4.3/22",
                                "peer": "124.0.0.3",
                                "path": [1, 2, 3, 4321, 5060, 2914],
                                "originAS": [2914],
                                "nextHop": "124.0.0.3",
                                "aggregator": null
                            },
                            "extra": {
                                "lengthViolation": true,
                                "matchDescription": "test description2"
                            }
                        }
                    ]
            },

            "99.5.4.3/22-0": {
                id: '99.5.4.3/22-0',
                origin: 'path-matching',
                affected: "99.5.4.3/22",
                message: 'Matched test description on prefix 99.5.4.3/22 1 times',
                data: [
                    {
                        "affected": "99.5.4.3/22",
                        "matchedRule": {
                            "prefix": "99.5.4.3/22",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors": [],
                            "includeMonitors": [],
                            "description": "path matching test regex and minLength",
                            "asn": [2914],
                            "ignoreMorespecifics": false,
                            "path": {
                                "match": ".*2914$",
                                "minLength": 2,
                                "matchDescription": "test description"
                            }
                        },
                        "matchedMessage": {
                            "type": "announcement",
                            "prefix": "99.5.4.3/22",
                            "peer": "124.0.0.3",
                            "path": [1, 2, 3, 4321, 5060, 2914],
                            "originAS": [2914],
                            "nextHop": "124.0.0.3",
                            "aggregator": null
                        },
                        "extra": {
                            "lengthViolation": false,
                            "matchDescription": "test description"
                        }
                    }
                ]
            },
        };

        let pathTestCompleted = false;
        pubSub.subscribe("path", (message, type) => {
            try {
                if (!pathTestCompleted) {
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
                    if (Object.keys(expectedData).length === 0) {
                        setTimeout(() => {
                            pathTestCompleted = true;
                            done();
                        }, 5000);
                    }
                }
            } catch (error) {
                pathTestCompleted = true;
                done(error);
            }
        });
        pubSub.publish("test-type", "path");

    }).timeout(asyncTimeout);

    it("asn monitoring reporting", function (done) {

        const expectedData = {
            "2914-2.2.2.3/22": {
                id:  "2914-2.2.2.3/22",
                origin: 'asn-monitor',
                affected: 2914,
                message: 'AS2914 is announcing 2.2.2.3/22 but this prefix is not in the configured list of announced prefixes',
            },
            "2914-2001:db9:123::/49": {
                id: '2914-2001:db9:123::/49',
                origin: 'asn-monitor',
                affected: 2914,
                message: 'AS2914 is announcing 2001:db9:123::/49 but this prefix is not in the configured list of announced prefixes',
            }
        };

        let misconfigurationTestCompleted = false;
        pubSub.subscribe("misconfiguration", (message, type) => {

            if (!misconfigurationTestCompleted) {
                try {
                    message = JSON.parse(JSON.stringify(message));
                    const id = message.id;

                    expect(Object.keys(expectedData).includes(id)).to.equal(true);
                    expect(expectedData[id] != null).to.equal(true);
                    expect(message).to.containSubset(expectedData[id]);
                    expect(message).to.contain
                        .keys([
                            "latest",
                            "earliest"
                        ]);

                    delete expectedData[id];
                    if (Object.keys(expectedData).length === 0) {
                        setTimeout(() => {
                            misconfigurationTestCompleted = true;
                            done();
                        }, 5000);
                    }
                } catch (error) {
                    misconfigurationTestCompleted = true;
                    done(error);
                }
            }
        });
        pubSub.publish("test-type", "misconfiguration");

    }).timeout(asyncTimeout);

    it("fading alerting", function (done) {
        let notReceived = true;

        setTimeout(() => {
            if (notReceived){
                done();
            } else {
                done(new Error("Not received"));
            }
        }, 15000);

        pubSub.subscribe("visibility", function (message, type) {
            notReceived = false;
        });
        pubSub.publish("test-type", "fade-off");
    }).timeout(asyncTimeout);

    it("pull API alerting", function (done) {

        setTimeout(() => {
            axios({
                url: "http://localhost:8011/alerts/8e402e65f393ba4812df5da0db7605e9",
                responseType: "json",
                method: "GET"
            })
                .then(a => {
                    expect(a.data.data[0].hash).to.equal("8e402e65f393ba4812df5da0db7605e9");
                    done();
                });
        }, 10000);


    }).timeout(asyncTimeout);
});

describe("Status storage", function () {
    it("alerts stored", function (done) {

        const files = fs.readdirSync(cacheCloneDirectory);

        for (let f of files) {
            const fileClone = cacheCloneDirectory + f;
            const fileOriginal = volume + ".cache/" + f;
            const exists = fs.existsSync(fileOriginal);

            expect(exists).to.equal(true);

            if (exists) {
                const clone = JSON.parse(fs.readFileSync(fileClone, 'utf8')).value;
                const original = JSON.parse(fs.readFileSync(fileOriginal, 'utf8')).value;
                expect(original.sent).to.have.keys(Object.keys(clone.sent));
            }
        }
        done();

    }).timeout(asyncTimeout);
});
