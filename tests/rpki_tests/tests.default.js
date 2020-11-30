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
const expect = chai.expect;
const asyncTimeout = 200000;
chai.use(chaiSubset);

const cacheFile = ".cache/seen-rpki-valid-announcements.json";
if (fs.existsSync(cacheFile)) {
    fs.unlinkSync(cacheFile);
}

global.EXTERNAL_CONFIG_FILE = "tests/rpki_tests/config.rpki.test.default.yml";
const worker = require("../../index");
const pubSub = worker.pubSub;


describe("RPKI monitoring 1", function() {

    it("default connector", function (done) {

        const expectedData = {

            "a103_21_244_0_24-13335-false": {
                id:  "a103_21_244_0_24-13335-false",
                origin: 'rpki-monitor',
                affected: '103.21.244.0/24',
                message: 'The route 103.21.244.0/24 announced by AS13335 is not RPKI valid. Valid ROAs: 103.21.244.0/23|AS0|maxLength:23',
            },

            "a8_8_8_8_22-2914-null": {
                id:  "a8_8_8_8_22-2914-null",
                origin: 'rpki-monitor',
                affected: '8.8.8.8/22',
                message: 'The route 8.8.8.8/22 announced by AS2914 is not covered by a ROA',
            }
        };

        let rpkiTestCompleted = false;
        let started = false;
        pubSub.subscribe("rpki", function (type, message) {
            try {
                if (started && !rpkiTestCompleted) {
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
                            rpkiTestCompleted = true;
                            done();
                        }, 5000);
                    }
                }
            } catch (error) {
                rpkiTestCompleted = true;
                done(error);
            }
        });
        pubSub.publish("test-type", "rpki");
        started = true;
    }).timeout(asyncTimeout);

});