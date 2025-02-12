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
    fs.rmSync(volume, {recursive: true});
    fs.mkdirSync(volume, {recursive: true});
}
fs.copyFileSync("tests/dump_tests/config.test.yml", volume + "config.test.yml");
fs.copyFileSync("tests/dump_tests/prefixes.test.yml", volume + "prefixes.test.yml");

describe("Alerting", function () {

    it("RIS dump test", function (done) {

        const worker = require("../../index");
        const pubSub = worker.pubSub;

        const expectedData = {
            "3333-193.0.20.0/23": {
                id: "3333-193.0.20.0/23",
                truncated: false,
                origin: "basic-hijack-detection",
                affected: 1234,
                message: "The prefix 193.0.20.0/23 (No description provided) is announced by AS3333 instead of AS1234",
                data: [
                    {
                        affected: 1234
                    }
                ]
            }
        };

        let dumpTestCompleted = false;
        pubSub.subscribe("hijack", function (message, type) {
            try {
                if (!dumpTestCompleted) {
                    message = JSON.parse(JSON.stringify(message));
                    const id = message.id;

                    expect(Object.keys(expectedData).includes(id)).to.equal(true);
                    expect(expectedData[id] != null).to.equal(true);

                    expect(message).to
                        .containSubset(expectedData[id]);

                    delete expectedData[id];
                    if (Object.keys(expectedData).length === 0) {
                        setTimeout(() => {
                            dumpTestCompleted = true;
                            done();
                        }, 5000);
                    }
                }
            } catch (error) {
                dumpTestCompleted = true;
                done(error);
            }
        });

    }).timeout(asyncTimeout);

});