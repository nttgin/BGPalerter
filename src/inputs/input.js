
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

import ipUtils from "ip-sub";
import inquirer from "inquirer";
import generatePrefixes from "../generatePrefixesList";

export default class Input {

    constructor(env){
        this.prefixes = [];
        this.asns = [];
        this.cache = {
            af: {},
            binaries: {}
        };
        this.config = env.config;
        this.storage = env.storage;
        this.logger = env.logger;
        this.callbacks = [];
        this.prefixListStorageKey = 'generate-prefixes-config';

        setTimeout(() => {
            this.loadPrefixes()
                .then(() => {
                    this._change();
                })
                .catch(error => {
                    this.logger.log({
                        level: 'error',
                        message: error
                    });
                    console.log(error);
                    process.exit();
                });
        }, 200);

        this.setReGeneratePrefixList();
    };

    _isAlreadyContained = (prefix, lessSpecifics) => {
        const p1b = ipUtils.getNetmask(prefix);
        const p1af = ipUtils.getAddressFamily(prefix);

        for (let p2 of lessSpecifics) {
            if (p1af === ipUtils.getAddressFamily(p2.prefix) &&
                ipUtils.isSubnetBinary(ipUtils.getNetmask(p2.prefix), p1b)) {
                return true;
            }

        }

        return false;
    };

    onChange = (callback) => {
        this.callbacks.push(callback);
    };

    _change = () => {
        for (let call of this.callbacks) {
            call();
        }
    };

    getMonitoredLessSpecifics = () => {

        if (!this.prefixes.length) {
            return [];
        }

        const lessSpecifics = [];
        let prefixes = this.prefixes;
        lessSpecifics.push(prefixes[prefixes.length - 1]);

        for (let n=prefixes.length - 2; n>=0; n--) {
            const p1 = prefixes[n];
            if (!this._isAlreadyContained(p1.prefix, lessSpecifics)){
                lessSpecifics.push(p1);
            }
        }
        return lessSpecifics;
    };

    getMonitoredMoreSpecifics = () => {
        throw new Error('The method getMonitoredMoreSpecifics MUST be implemented');
    };

    getMonitoredPrefixes = () => {
        throw new Error('The method getMonitoredPrefixes MUST be implemented');
    };

    getMoreSpecificMatch = (prefix, includeIgnoredMorespecifics) => {

        for (let p of this.prefixes) {
            if (ipUtils._isEqualPrefix(p.prefix, prefix)) { // Used internal method to avoid validation overhead
                return p;
            } else {

                if (!this.cache.af[p.prefix] || !this.cache.binaries[p.prefix]) {
                    this.cache.af[p.prefix] = ipUtils.getAddressFamily(p.prefix);
                    this.cache.binaries[p.prefix] = ipUtils.getNetmask(p.prefix);
                }
                const prefixAf = ipUtils.getAddressFamily(prefix);

                if (prefixAf === this.cache.af[p.prefix]) {

                    const prefixBinary = ipUtils.getNetmask(prefix);
                    if (ipUtils.isSubnetBinary(this.cache.binaries[p.prefix], prefixBinary)) {
                        if (includeIgnoredMorespecifics || !p.ignoreMorespecifics) {
                            return p;
                        } else {
                            return null;
                        }
                    }
                }
            }
        }

        return null;
    };

    getMonitoredASns = () => {
        throw new Error('The method getMonitoredASns MUST be implemented');
    };

    loadPrefixes = () => {
        throw new Error('The method loadPrefixes MUST be implemented');
    };

    save = () => {
        throw new Error('The method save MUST be implemented');
    };

    generate = () => {
        return inquirer
            .prompt([
                {
                    type: 'confirm',
                    name: 'continue',
                    message: "The file prefixes.yml cannot be loaded. Do you want to auto-configure BGPalerter?",
                    default: true
                }
            ])
            .then((answer) => {
                if (answer.continue) {
                    return inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'asns',
                                message: "Which Autonomous System(s) you want to monitor? (comma-separated, e.g. 2914,3333)",
                                default: true,
                                validate: function(value) {
                                    const asns = value.split(",").filter(i => i !== "" && !isNaN(i));
                                    return asns.length > 0;
                                }
                            },

                            {
                                type: 'confirm',
                                name: 'i',
                                message: "Are there sub-prefixes delegated to other ASes? (e.g. sub-prefixes announced by customers)",
                                default: true
                            },

                            {
                                type: 'confirm',
                                name: 'm',
                                message: "Do you want to be notified when your AS is announcing a new prefix?",
                                default: true
                            }
                        ])
                        .then((answer) => {
                            // const generatePrefixes = require("../generatePrefixesList");
                            const asns = answer.asns.split(",");

                            const inputParameters = {
                                asnList: asns,
                                outputFile: this.config.volume + "prefixes.yml",
                                exclude: [],
                                excludeDelegated: answer.i,
                                prefixes: null,
                                monitoredASes: answer.m ? asns : [],
                                httpProxy: null,
                                debug: false,
                                historical: false,
                                group: null,
                                append: false,
                                logger: null
                            };

                            if (this.config.generatePrefixListEveryDays >= 1 && this.storage) {
                                return this.storage
                                    .set(this.prefixListStorageKey, inputParameters)
                                    .then(() => generatePrefixes(inputParameters))
                                    .catch(error => {
                                        this.logger.log({
                                            level: 'error',
                                            message: error
                                        });
                                    });
                            } else {
                                return generatePrefixes(inputParameters);
                            }

                        });
                } else {
                    throw new Error("Nothing to monitor.");
                }
            });


    };

    _reGeneratePrefixList = () => {
        this.logger.log({
            level: 'info',
            message: "Updating prefix list"
        });

        this.storage
            .get(this.prefixListStorageKey)
            .then(inputParameters => {

                if (inputParameters && Object.keys(inputParameters).length > 0) {
                    inputParameters.logger = (message) => {
                        this.logger.log({
                            level: 'info',
                            message
                        });
                    };

                    return generatePrefixes(inputParameters);
                } else {
                    throw new Error("The prefix list cannot be refreshed because it was not generated automatically or the cache has been deleted.");
                }
            })
            .then(() => {
                this.logger.log({
                    level: 'info',
                    message: "Prefix list updated. See prefixes.yml."
                });
                this.setReGeneratePrefixList();
            })
            .catch(error => {
                this.logger.log({
                    level: 'error',
                    message: error
                });
            });
    };

    setReGeneratePrefixList = () => {
        if (this.config.generatePrefixListEveryDays >= 1 && this.storage) {
            const refreshTimer = Math.ceil(this.config.generatePrefixListEveryDays) * 24 * 3600 * 1000;

            if (this.regeneratePrefixListTimer) {
                clearTimeout(this.regeneratePrefixListTimer);
            }
            this.regeneratePrefixListTimer = setTimeout(this._reGeneratePrefixList, refreshTimer);
        }
    };

}