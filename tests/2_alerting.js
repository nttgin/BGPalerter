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
var model = require('../src/model');
const resetCache = require('resnap')();
chai.use(chaiSubset);
var expect = chai.expect;

var asyncTimeout = 20000;
global.EXTERNAL_VERSION_FOR_TEST = "0.0.1";
global.EXTERNAL_CONFIG_FILE = "tests/config.test.yml";


describe("Alerting", function () {

    beforeEach(resetCache);
    var worker = require("../index");
    var pubSub = worker.pubSub;

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

    }).timeout(asyncTimeout);

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
                            group:"default",
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

    }).timeout(asyncTimeout);

    it("newprefix reporting", function (done) {

        pubSub.publish("test-type", "newprefix");

        const expectedData = {
            "1234-175.254.205.0/25": {
                id: '1234-175.254.205.0/25',
                origin: 'prefix-detection',
                affected: 1234,
                message: 'Possible change of configuration. A new prefix 175.254.205.0/25 is announced by AS1234. It is a more specific of 175.254.205.0/24 (include exclude test).',
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
                message: 'Possible change of configuration. A new prefix 170.254.205.0/25 is announced by AS1234. It is a more specific of 170.254.205.0/24 (include exclude test).',
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
                    message: 'Possible change of configuration. A new prefix 165.254.255.0/25 is announced by AS15562. It is a more specific of 165.254.255.0/24 (description 2).',
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
                            group: 'default',
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
            }

        });



    }).timeout(asyncTimeout);

    it("path match reporting", function (done) {

        pubSub.publish("test-type", "path");

        const expectedData = {
            "98.5.4.3/22": {
                id: '98.5.4.3/22',
                origin: 'path-matching',
                affected: "98.5.4.3/22",
                message: 'Matched test description on prefix 98.5.4.3/22 (including length violation) 1 times.',
                data: [
                    {
                        extra: {
                            lengthViolation: true
                        },
                        matchedRule: {
                            prefix: '98.5.4.3/22',
                            group: 'default',
                            description: 'path matching test regex and maxLength',
                            asn: [2914],
                            ignoreMorespecifics: false,
                            ignore: false,
                            path: {
                                match: ".*2914$",
                                matchDescription: "test description",
                                maxLength: 3,
                            }
                        },
                        matchedMessage: {
                            type: 'announcement',
                            prefix: '98.5.4.3/22',
                            peer: '124.0.0.3',
                            path: [1, 2, 3, 4321, 5060, 2914],
                            originAS: [2914],
                            nextHop: '124.0.0.3'
                        }
                    }
                ]
            },

            "99.5.4.3/22": {
                id: '99.5.4.3/22',
                origin: 'path-matching',
                affected: "99.5.4.3/22",
                message: 'Matched test description on prefix 99.5.4.3/22 1 times.',
                data: [
                    {
                        extra: {
                            lengthViolation: false
                        },
                        matchedRule: {
                            prefix: '99.5.4.3/22',
                            group: 'default',
                            description: 'path matching test regex and minLength',
                            asn: [2914],
                            ignoreMorespecifics: false,
                            ignore: false,
                            path: {
                                match: ".*2914$",
                                matchDescription: "test description",
                                minLength: 2,
                            }
                        },
                        matchedMessage: {
                            type: 'announcement',
                            prefix: '99.5.4.3/22',
                            peer: '124.0.0.3',
                            path: [1, 2, 3, 4321, 5060, 2914],
                            originAS: [2914],
                            nextHop: '124.0.0.3'
                        }
                    }
                ]
            },
        };

        pubSub.subscribe("path", function (type, message) {

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

    }).timeout(asyncTimeout);





    it("asn monitoring reporting", function (done) {

        pubSub.publish("test-type", "misconfiguration");

        const expectedData = {
            "2914": {
                id: '2914',
                origin: 'asn-monitor',
                affected: 2914,
                message: 'AS2914 is announcing 2.2.2.3/22 but this prefix is not in the configured list of announced prefixes',
            }
        };

        pubSub.subscribe("misconfiguration", function (type, message) {

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
                }, asyncTimeout + 10000);
            }

        });



    }).timeout(asyncTimeout);

});
