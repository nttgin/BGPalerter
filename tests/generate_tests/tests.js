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
const yaml = require("js-yaml");
const chaiSubset = require('chai-subset');
const generatePrefixes = require('../../src/generatePrefixesList');
const expect = chai.expect;
const asyncTimeout = 60000;
chai.use(chaiSubset);

global.EXTERNAL_CONFIG_FILE = "tests/generate_tests/config.test.yml";

describe("Prefix List", function() {

    it("generate file - default group - exclude 1 prefix", function (done) {
        const asns = ["3333"];
        const outputFile = "tests/generate_tests/prefixes.yml";
        const originalFile = "tests/generate_tests/prefixes.final.default.yml";

        const inputParameters = {
            asnList: asns,
            outputFile,
            exclude: ["2001:67c:2e8::/48"],
            excludeDelegated: true,
            prefixes: null,
            monitoredASes: asns,
            httpProxy: null,
            debug: false,
            historical: false,
            group: null,
            append: false
        }
        console.log = function(){};
        generatePrefixes(inputParameters)
            .then(() => {
                const result = fs.readFileSync(outputFile, 'utf8');
                fs.unlinkSync(outputFile);
                const original = fs.readFileSync(originalFile, 'utf8');
                const resultJson = yaml.safeLoad(result) || {};
                const originalJson = yaml.safeLoad(original) || {};

                expect(resultJson).to.contain.keys(Object.keys(originalJson));
                expect(Object.keys(resultJson).length).to.equal(Object.keys(originalJson).length);

                expect(resultJson).to.containSubset(originalJson);
                done();
            });
    }).timeout(asyncTimeout);

    it("generate file - specific group - no exclude", function (done) {
        const asns = ["3333"];
        const outputFile = "tests/generate_tests/prefixes.yml";
        const originalFile = "tests/generate_tests/prefixes.final.group.yml";

        const inputParameters = {
            asnList: asns,
            outputFile,
            exclude: [],
            excludeDelegated: true,
            prefixes: null,
            monitoredASes: asns,
            httpProxy: null,
            debug: false,
            historical: false,
            group: "test",
            append: false
        }
        console.log = function(){};
        generatePrefixes(inputParameters)
            .then(() => {
                const result = fs.readFileSync(outputFile, 'utf8');
                fs.unlinkSync(outputFile);
                const original = fs.readFileSync(originalFile, 'utf8');
                const resultJson = yaml.safeLoad(result) || {};
                const originalJson = yaml.safeLoad(original) || {};

                expect(resultJson).to.contain.keys(Object.keys(originalJson));
                expect(Object.keys(resultJson).length).to.equal(Object.keys(originalJson).length);

                expect(resultJson).to.containSubset(originalJson);
                done();
            });
    }).timeout(asyncTimeout);
});