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
const restify = require("restify");
const asyncTimeout = 120000;
chai.use(chaiSubset);
const assert = chai.assert

global.EXTERNAL_VERSION_FOR_TEST = "0.0.1";
global.EXTERNAL_CONFIG_FILE = "tests/reports_tests/config.reports.test.yml";

describe("Reports 2", function() {
    const worker = require("../../index");
    const pubSub = worker.pubSub;

    it("reportHTTP", function (done) {
        const server = restify.createServer();
        server.pre(restify.pre.sanitizePath());
        server.use(restify.plugins.bodyParser({ mapParams: true }));
        let expectedData = [
            "The prefix 2a00:5884::/32 (alarig fix test) is announced by AS15563 instead of AS204092, and AS45. Top 1 most used AS paths: [2,3,15563].",
            "A new prefix 2a00:5884:ffff::/48 is announced by AS208585. It should be instead 2a00:5884::/32 (alarig fix test) announced by AS204092, and AS45. Top 1 most used AS paths: [2,3,208585].",
        ];

        pubSub.publish("test-type", "hijack");
        server.post('/test', function (req, res, next) {
            const text = req.body.text;
            if (expectedData.includes(text)) {
                expectedData = expectedData.filter(i => i !== text);
            } else {
                assert.fail(text, "none", "The message is not expected");
            }

            if (expectedData.length === 0) {
                done();
            }
        });
        server.listen(8090);

    }).timeout(asyncTimeout);
});