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
chai.use(chaiSubset);
const expect = chai.expect;
const axios = require('axios');

const asyncTimeout = 120000;
global.EXTERNAL_VERSION_FOR_TEST = "0.0.1";
global.EXTERNAL_CONFIG_FILE = "tests/proxy_tests/config.proxy.test.yml";

describe("Composition", function() {

    const worker = require("../../index");
    const pubSub = worker.pubSub;
    const config = worker.config;

    describe("Software updates check", function () {
        it("new version detected with proxy", function (done) {

            pubSub.subscribe("software-update", function (message, type) {
                expect(type).to.equal("software-update");
                done();
            });
        }).timeout(asyncTimeout);
    });

    describe("Configuration loader", function () {

        it("config structure - proxy config loaded", function () {
            expect(config).to.have
                .keys([
                    "alertOnlyOnce",
                    "checkFadeOffGroupsSeconds",
                    "checkForUpdatesAtBoot",
                    "connectors",
                    "environment",
                    "fadeOffSeconds",
                    "httpProxy",
                    "logging",
                    "maxMessagesPerSecond",
                    "monitoredPrefixesFiles",
                    "monitors",
                    "multiProcess",
                    "notificationIntervalSeconds",
                    "pidFile",
                    "processMonitors",
                    "reports",
                    "volume"
                ]);
            expect(config.connectors[0]).to.have
                .property('class')
        });

    });

    describe("Uptime Monitor", function () {

        it("uptime config", function () {
            expect(config.processMonitors[0]).to
                .containSubset({
                    params: {
                        useStatusCodes: true,
                        host: null,
                        port: 8012
                    }
                });
        });

        // it("RIS connected with proxy", function (done) {
        //
        //     const port = config.processMonitors[0].params.port;
        //
        //     const action = () => {
        //         return axios({
        //             method: 'get',
        //             responseType: 'json',
        //             url: `http://localhost:${port}/status`
        //         })
        //             .then(data => {
        //                 expect(data.status).to.equal(200);
        //                 expect(data.data.warning).to.equal(false);
        //                 done();
        //             });
        //     }
        //
        //
        //     action()
        //         .catch(() => {
        //             return action(); // Trying again
        //         })
        //         .catch(error => {
        //             console.log(error);
        //         });
        //
        // }).timeout(asyncTimeout);
    });

});