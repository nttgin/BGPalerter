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
const asyncTimeout = 20000;

// Prepare test environment
if (!fs.existsSync(volume)) {
    fs.mkdirSync(volume);
}
fs.copyFileSync("tests/config.test.yml", volume + "config.test.yml");
fs.copyFileSync("tests/prefixes.test.yml", volume + "prefixes.test.yml");
fs.copyFileSync("tests/groups.test.yml", volume + "groups.test.yml");

global.EXTERNAL_CONFIG_FILE = volume + "config.test.yml";

const worker = require("../index");

// Check if groups are loaded on file change

describe("External groups file", function() {

    it("load groups", function () {
        const config = worker.config;
        expect(config.groupsFile).to.equal("groups.test.yml");
        expect(config.reports[0].params.userGroups).to
            .containSubset({
                test:  [
                    "filename"
                ]
            });
    })
        .timeout(asyncTimeout);

    it("watch groups", function (done) {

        fs.copyFileSync("tests/groups.test.after.yml", "volumetests/groups.test.yml");

        setTimeout(() => {
            const config = worker.config;
            expect(config.reports[0].params.userGroups).to
                .containSubset({
                    test:  [
                        "filename-after"
                    ]
                });
            done();
        }, 10000);

    })
        .timeout(asyncTimeout);
});