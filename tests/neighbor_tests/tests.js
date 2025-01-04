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
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);
const expect = chai.expect;
const volume = "volumetests/";
const asyncTimeout = 120000;
global.EXTERNAL_VERSION_FOR_TEST = "0.0.1";
global.EXTERNAL_CONFIG_FILE = volume + "config.test.yml";

// Prepare test environment
if (!fs.existsSync(volume)) {
    fs.mkdirSync(volume, {recursive: true});
} else {
    fs.rmdirSync(volume, {recursive: true});
    fs.mkdirSync(volume, {recursive: true});
}
fs.copyFileSync("tests/neighbor_tests/config.test.yml", volume + "config.test.yml");
fs.copyFileSync("tests/neighbor_tests/prefixes.test.yml", volume + "prefixes.test.yml");
fs.copyFileSync("tests/neighbor_tests/groups.test.yml", volume + "groups.test.yml");


const worker = require("../../index");
const pubSub = worker.pubSub;

describe("Alerting", function () {

    it("path-neighbors monitoring reporting", function (done) {

        const expectedData = {
            "101-30": {
                "id": "101-30",
                "truncated": false,
                "origin": "path-neighbors",
                "affected": 101,
                "message": "A new upstream of AS101 has been detected: AS30",
                "data": [{
                    "affected": 101,
                    "matchedRule": {
                        "asn": [101],
                        "group": ["default"],
                        "upstreams": [100],
                        "downstreams": [104]
                    },
                    "matchedMessage": {
                        "type": "announcement",
                        "prefix": "99.5.4.3/22",
                        "peer": "124.0.0.3",
                        "path": [98, 99, 30, 101, 104],
                        "originAS": [104],
                        "nextHop": "124.0.0.3",
                        "aggregator": null,
                        "communities": []
                    },
                    "extra": {"side": "upstream", "neighbor": 30}
                }]
            },

            "80-100": {
                "id": "80-100",
                "truncated": false,
                "origin": "path-neighbors",
                "affected": 80,
                "message": "A new downstream of AS80 has been detected: AS100",
                "data": [{
                    "affected": 80,
                    "matchedRule": {
                        "asn": [80],
                        "group": ["default"],
                        "upstreams": [99],
                        "downstreams": null
                    },
                    "matchedMessage": {
                        "type": "announcement",
                        "prefix": "99.5.4.3/22",
                        "peer": "124.0.0.3",
                        "path": [98, 99, 80, 100],
                        "originAS": [100],
                        "nextHop": "124.0.0.3",
                        "aggregator": null,
                        "communities": []
                    },
                    "extra": {"side": "downstream", "neighbor": 100}
                }]
            },

            "101-106": {
                "id": "101-106",
                "truncated": false,
                "origin": "path-neighbors",
                "affected": 101,
                "message": "A new downstream of AS101 has been detected: AS106",
                "data": [{
                    "affected": 101,
                    "matchedRule": {
                        "asn": [101],
                        "group": ["default"],
                        "upstreams": [100],
                        "downstreams": [104]
                    },
                    "matchedMessage": {
                        "type": "announcement",
                        "prefix": "9.5.4.3/22",
                        "peer": "124.0.0.3",
                        "path": [98, 99, 100, 101, 106],
                        "originAS": [106],
                        "nextHop": "124.0.0.3",
                        "aggregator": null,
                        "communities": []
                    },
                    "extra": {"side": "downstream", "neighbor": 106}
                }]
            }
        };

        let pathNeighborsTestcompleted = false;
        pubSub.subscribe("path-neighbors", (message, type) => {

            if (!pathNeighborsTestcompleted) {
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
                            pathNeighborsTestcompleted = true;
                            done();
                        }, 5000);
                    }
                } catch (error) {
                    pathNeighborsTestcompleted = true;
                    done(error);
                }
            }
        });
        pubSub.publish("test-type", "path-neighbors");

    }).timeout(asyncTimeout);

});