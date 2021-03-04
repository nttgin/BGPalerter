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

// ROAs before
fs.copyFileSync("tests/rpki_tests/roas.before.json", "tests/rpki_tests/roas.json");

setTimeout(() => {
    // ROAs after
    fs.copyFileSync("tests/rpki_tests/roas.after.json", "tests/rpki_tests/roas.json");
}, 30000);

const worker = require("../../index");
const pubSub = worker.pubSub;

describe("RPKI monitoring external", function() {

    it("ROA diff - external connector", function (done) {

        const expectedData = {

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