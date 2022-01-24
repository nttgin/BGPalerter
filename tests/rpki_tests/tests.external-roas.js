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
const fs = require('fs');
const expect = chai.expect;
const asyncTimeout = 200000;
chai.use(chaiSubset);

global.EXTERNAL_CONFIG_FILE = "tests/rpki_tests/config.rpki.test.external-roas.yml";
global.EXTERNAL_ROA_EXPIRATION_TEST = 5000;

// ROAs before
fs.copyFileSync("tests/rpki_tests/roas.before.json", "tests/rpki_tests/roas.json");

setTimeout(() => {
    // ROAs after
    fs.copyFileSync("tests/rpki_tests/roas.after.json", "tests/rpki_tests/roas.json");
}, 30000);

const worker = require("../../index");
const pubSub = worker.pubSub;

describe("RPKI monitoring external", function() {

    it("ROA diff and expiration - external connector", function (done) {

        const expectedData = {
            "disappeared-ripe": {
                id: 'disappeared-ripe',
                truncated: false,
                origin: 'rpki-monitor',
                affected: 'ripe',
                message: 'Possible TA malfunction or incomplete VRP file: 60.00% of the ROAs disappeared from ripe',
                data: [
                    {
                        affected: 'ripe',
                        matchedMessage: 'Possible TA malfunction or incomplete VRP file: 60.00% of the ROAs disappeared from ripe'
                    }
                ]
            },
            "expiring-ripe": {
                id: 'expiring-ripe',
                truncated: false,
                origin: 'rpki-monitor',
                affected: 'ripe',
                message: 'Possible TA malfunction or incomplete VRP file: 50.00% of the ROAs are expiring in ripe',
                data: [
                    {
                        affected: 'ripe',
                        matchedMessage: 'Possible TA malfunction or incomplete VRP file: 50.00% of the ROAs are expiring in ripe',
                        extra: {}
                    }
                ]
            }
            ,
            "28c7aa78b6286e0e3c6583797f7df47c": {
                id: '28c7aa78b6286e0e3c6583797f7df47c',
                truncated: false,
                origin: 'rpki-monitor',
                affected: 2914,
                message: 'The following ROAs will expire in less than 2 hours: <1.2.3.0/24, 2914, 24, ripe>',

            },
            "47807c7558dbe001b4aad9f3a87eb427": {
                id: '47807c7558dbe001b4aad9f3a87eb427',
                truncated: false,
                origin: 'rpki-monitor',
                affected: '94.5.4.3/22',
                message: 'ROAs change detected: removed <94.5.4.3/22, 2914, 22, ripe>'
            },
            "de3bd9a6cdeeb05e1c2c7c04f7220485" : {
                id: 'de3bd9a6cdeeb05e1c2c7c04f7220485',
                truncated: false,
                origin: 'rpki-monitor',
                affected: '2001:db8:123::/48',
                message: 'ROAs change detected: removed <2001:db8:123::/48, 65000, 48, ripe>'
            },
            "129aafe3c8402fb045b71e810a73d425": {
                id: '129aafe3c8402fb045b71e810a73d425',
                truncated: false,
                origin: 'rpki-monitor',
                affected: 2914,
                message: 'ROAs change detected: removed <2.3.4.0/24, 2914, 24, ripe>'
            }
        };

        let rpkiTestCompletedExternal = false;
        pubSub.subscribe("rpki", function (message, type) {

            try {
                if (!rpkiTestCompletedExternal) {
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
                        rpkiTestCompletedExternal = true;
                        done();
                    }
                }
            } catch (error) {
                rpkiTestCompletedExternal = true;
                done(error);
            }
        });

    }).timeout(asyncTimeout);
});