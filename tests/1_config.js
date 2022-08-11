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
const chaiSubset = require('chai-subset');
const readLastLines = require('read-last-lines');
const moment = require('moment');
const fs = require('fs');
chai.use(chaiSubset);
const expect = chai.expect;
const volume = "volumetests/";
const asyncTimeout = 120000;

global.EXTERNAL_VERSION_FOR_TEST = "0.0.1";
global.EXTERNAL_CONFIG_FILE = volume + "config.test.yml";

// Prepare test environment
if (!fs.existsSync(volume)) {
    fs.mkdirSync(volume);
}
fs.copyFileSync("tests/config.test.yml", volume + "config.test.yml");
fs.copyFileSync("tests/prefixes.test.yml", volume + "prefixes.test.yml");
fs.copyFileSync("tests/groups.test.yml", volume + "groups.test.yml");

describe("Core functions", function() {

    describe("Configuration loader", function () {
        const worker = require("../index");
        const config = worker.config;

        it("config structure", function () {
            expect(config).to.have
                .keys([
                    "environment",
                    "connectors",
                    "monitors",
                    "reports",
                    "notificationIntervalSeconds",
                    "alertOnlyOnce",
                    "monitoredPrefixesFiles",
                    "logging",
                    "checkForUpdatesAtBoot",
                    "processMonitors",
                    "pidFile",
                    "multiProcess",
                    "maxMessagesPerSecond",
                    "fadeOffSeconds",
                    "checkFadeOffGroupsSeconds",
                    "volume",
                    "groupsFile",
                    "persistStatus",
                    "rpki",
                    "rest"
                ]);

            expect(config.connectors[0]).to.have
                .property('class')
        });

        it("volume setting", function () {
            expect(config.volume).to.equals(volume);
        });

        it("check for updates setting", function () {
            expect(config.checkForUpdatesAtBoot).to.equals(true);
        });

        it("loading connectors", function () {
            expect(config.connectors[0]).to
                .containSubset({
                    "params": { "testType": "withdrawal" },
                    "name": "tes"
                });
            expect(config.connectors[0]).to.have
                .property('class')
        });

        it("loading monitors", function () {

            expect(config.monitors.length).to.equal(8);

            expect(config.monitors[0]).to
                .containSubset({
                    "channel": "hijack",
                    "name": "basic-hijack-detection",
                    "params": {
                        "thresholdMinPeers": 0
                    }
                });

            expect(config.monitors[1]).to
                .containSubset({
                    "channel": "newprefix",
                    "name": "prefix-detection",
                    "params": {
                        "thresholdMinPeers": 0
                    }
                });

            expect(config.monitors[2]).to
                .containSubset({
                    "channel": "visibility",
                    "name": "withdrawal-detection",
                    "params": {
                        "thresholdMinPeers": 4
                    }
                });

            expect(config.monitors[3]).to
                .containSubset({
                    "channel": "path",
                    "name": "path-matching",
                    "params": {
                        "thresholdMinPeers": 0
                    }
                });

            expect(config.monitors[4]).to
                .containSubset({
                    "channel": "misconfiguration",
                    "name": "asn-monitor",
                    "params": {
                        "thresholdMinPeers": 2
                    }
                });

            expect(config.monitors[5]).to
                .containSubset({
                    "channel": "rpki",
                    "name": "rpki-monitor",
                    "params": {
                        "thresholdMinPeers": 1,
                        "checkUncovered": true
                    }
                });

            expect(config.monitors[6]).to
                .containSubset({
                    "channel": "roa",
                    "name": "roa-diff"
                });

            expect(config.monitors[config.monitors.length - 1]).to
                .containSubset({
                    "channel": "software-update",
                    "name": "software-update",
                    "params": undefined
                });


            expect(config.monitors[0]).to.have
                .property('class')
        });

        it("loading reports", function () {
            expect(config.reports[0]).to
                .containSubset({
                    "channels": [
                        "hijack",
                        "newprefix",
                        "visibility",
                        "rpki",
                        "roa",
                        "misconfiguration",
                        "path"
                    ],
                    "params": {}
                });

            expect(config.reports[0]).to.have
                .property('class')
        });

        it("rpki config", function () {
            expect(config.rpki).to
                .containSubset({
                    "vrpProvider": "ntt",
                    "preCacheROAs": true,
                    "refreshVrpListMinutes": 15,
                    "markDataAsStaleAfterMinutes": 120
                });
        });

    });

    describe("Software updates check", function () {
        it("new version detected", function (done) {

            const worker = require("../index");
            const pubSub = worker.pubSub;

            pubSub.subscribe("software-update", function (message, type) {
                expect(type).to.equal("software-update");
                done();
            });
        }).timeout(40000);
    });

    describe("Input loader", function () {
        const worker = require("../index");
        const input = worker.input;

        it("loading prefixes", function () {

            expect(input.prefixes.length).to.equal(15);

            expect(JSON.parse(JSON.stringify(input))).to
                .containSubset({
                    "prefixes": [
                        {
                            "asn": [1234],
                            "description": "rpki valid not monitored AS",
                            "ignoreMorespecifics": false,
                            "prefix": "193.0.0.0/21",
                            "group": "default",
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [15562],
                            "description": "description 1",
                            "ignoreMorespecifics": false,
                            "prefix": "165.254.225.0/24",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [15562],
                            "description": "description 2",
                            "ignoreMorespecifics": false,
                            "prefix": "165.254.255.0/24",
                            "group": "groupName",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [15562],
                            "description": "description 3",
                            "ignoreMorespecifics": true,
                            "prefix": "192.147.168.0/24",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [204092, 45],
                            "description": "alarig fix test",
                            "ignoreMorespecifics": false,
                            "prefix": "2a00:5884::/32",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [208585],
                            "description": "alarig fix test 2",
                            "ignoreMorespecifics": false,
                            "prefix": "2a0e:f40::/29",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [1234],
                            "description": "ignore sub test",
                            "ignoreMorespecifics": true,
                            "prefix": "2a0e:f40::/30",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [1234],
                            "description": "ignore flag test",
                            "ignoreMorespecifics": true,
                            "prefix": "2a0e:240::/32",
                            "group": "default",
                            "ignore": true,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [1234],
                            "description": "include exclude test",
                            "ignoreMorespecifics": false,
                            "prefix": "175.254.205.0/24",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : ["basic-hijack-detection", "withdrawal-detection"],
                            "includeMonitors": []
                        },
                        {
                            "asn": [1234],
                            "description": "include exclude test",
                            "ignoreMorespecifics": false,
                            "prefix": "170.254.205.0/24",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": ["prefix-detection"]
                        },
                        {
                            "asn": [15562],
                            "description": "test fade off",
                            "ignoreMorespecifics": false,
                            "prefix": "165.24.225.0/24",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        },
                        {
                            "asn": [65000],
                            "description": "exact matching test",
                            "ignoreMorespecifics": true,
                            "prefix": "2001:db8:123::/48",
                            "group": "default",
                            "ignore": false,
                            "excludeMonitors" : [],
                            "includeMonitors": []
                        }
                    ]
                });

            expect(input.asns.map(i => i.asn.getValue())).to.eql([ 2914, 3333, 13335, 65000 ]);
        });
    });

    describe("Logging", function () {
        const worker = require("../index");
        const config = worker.config;
        const logger = worker.logger;

        it("errors logging on the right file", function (done) {
            const message = "Test message";
            logger
                .log({
                    level: "error",
                    message: message
                });

            const file = volume + config.logging.directory + "/error-" + moment().format('YYYY-MM-DD') + ".log";
            readLastLines
                .read(file, 1)
                .then((line) => {
                    const lineMessage = line.split(" ").slice(2, 4).join(" ").trim();

                    expect(lineMessage).to
                        .equal(message);
                    done();
                });

        }).timeout(20000);

        it("reports logging on the right file", function (done) {
            const message = "Test message";
            logger
                .log({
                    level: "verbose",
                    message: message
                });

            const file = volume + config.logging.directory + "/reports-" + moment().format('YYYY-MM-DD') + ".log";
            readLastLines
                .read(file, 1)
                .then((line) => {
                    const lineMessage = line.split(" ").slice(2, 5).join(" ").trim();
                    expect(lineMessage).to.equal(message);
                    done();
                });
        }).timeout(20000);

        it("write pid file", function (done) {
            const file = config.pidFile;
            expect("bgpalerter.pid").to.equal(file);

            if (file) {
                readLastLines
                    .read(file, 1)
                    .then((line) => {
                        expect(parseInt(line)).to.equal(process.pid);
                        done();
                    });
            }
        });

    });

});