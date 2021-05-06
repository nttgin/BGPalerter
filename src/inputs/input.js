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
            binaries: {},
            matched: {}
        };
        this.config = env.config;
        this.storage = env.storage;
        this.logger = env.logger;
        this.callbacks = [];
        this.prefixListDiffFailThreshold = 50;

        // This implements a fast basic fixed space cache, other approaches lru-like use too much cpu
        setInterval(() => {
            if (Object.keys(this.cache.matched).length > 10000) {
                delete this.cache.matched;
            }
        }, 10000);

        // This is to load the prefixes after the application is booted
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
    };

    _isAlreadyContained = (prefix, lessSpecifics) => {
        const p1af = ipUtils.getAddressFamily(prefix);
        const p1b = ipUtils.getNetmask(prefix, p1af);

        for (let p2 of lessSpecifics) {
            const p2af = ipUtils.getAddressFamily(p2.prefix);
            if (p1af === p2af &&
                ipUtils.isSubnetBinary(ipUtils.getNetmask(p2.prefix, p2af), p1b)) {
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
        const key = `${prefix}-${includeIgnoredMorespecifics}`;
        const cached = this.cache.matched[key];

        if (cached !== undefined) {
            return cached;
        } else {
            for (let p of this.prefixes) {
                if (ipUtils._isEqualPrefix(p.prefix, prefix)) {
                    this.cache.matched[key] = p;
                    return p;
                } else {

                    // if (!this.cache.af[p.prefix] || !this.cache.binaries[p.prefix]) {
                    if (!this.cache.af[p.prefix]) {
                        this.cache.af[p.prefix] = ipUtils.getAddressFamily(p.prefix);
                        this.cache.binaries[p.prefix] = ipUtils.getNetmask(p.prefix, this.cache.af[p.prefix]);
                    }
                    const prefixAf = ipUtils.getAddressFamily(prefix);

                    if (prefixAf === this.cache.af[p.prefix]) {

                        const prefixBinary = ipUtils.getNetmask(prefix, prefixAf);
                        if (ipUtils.isSubnetBinary(this.cache.binaries[p.prefix], prefixBinary)) {
                            if (includeIgnoredMorespecifics || !p.ignoreMorespecifics) {
                                this.cache.matched[key] = p;
                                return p;
                            } else {
                                this.cache.matched[key] = null;
                                return null;
                            }
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

    save = (data) => {
        throw new Error('The method save MUST be implemented');
    };

    retrieve = () => {
        throw new Error('The method retrieve MUST be implemented');
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
                                message: "Which Autonomous System(s) you want to monitor? (comma-separated, e.g., 2914,3333)",
                                default: null,
                                validate: function(value) {
                                    const asns = value.split(",").filter(i => i !== "" && !isNaN(i));
                                    return asns.length > 0;
                                }
                            },

                            {
                                type: 'confirm',
                                name: 'm',
                                message: "Do you want to be notified when your AS is announcing a new prefix?",
                                default: true
                            },

                            {
                                type: 'confirm',
                                name: 'upstreams',
                                message: "Do you want to be notified when a new upstream AS appears in a BGP path?",
                                default: true
                            },
                            {
                                type: 'confirm',
                                name: 'downstreams',
                                message: "Do you want to be notified when a new downstream AS appears in a BGP path?",
                                default: true
                            }
                        ])
                        .then((answer) => {
                            const asns = answer.asns.split(",");

                            const inputParameters = {
                                asnList: asns,
                                exclude: [],
                                excludeDelegated: true,
                                prefixes: null,
                                monitoredASes: answer.m ? asns : [],
                                httpProxy: this.config.httpProxy || null,
                                debug: false,
                                historical: false,
                                group: null,
                                append: false,
                                logger: null,
                                upstreams: !!answer.upstreams,
                                downstreams: !!answer.downstreams,
                                getCurrentPrefixesList: () => {
                                    return this.retrieve();
                                }
                            };

                            return generatePrefixes(inputParameters);

                        });
                } else {
                    throw new Error("Nothing to monitor.");
                }
            })
            .then(this.save)
            .then(() => {
                console.log("Done!");
            })
            .catch(error => {
                console.log(error);
                this.logger.log({
                    level: 'error',
                    message: error
                });
                process.exit();
            });
    };

    _reGeneratePrefixList = () => {
        this.logger.log({
            level: 'info',
            message: "Updating prefix list"
        });

        this.setReGeneratePrefixList();

        return this.retrieve()
            .then(oldPrefixList => {
                const inputParameters = oldPrefixList.options.generate;

                if (!inputParameters) {
                    throw new Error("The prefix list cannot be refreshed because it was not generated automatically.");
                }

                inputParameters.httpProxy = this.config.httpProxy || null;
                inputParameters.logger = (message) => {
                    // Nothing, ignore logs in this case (too many otherwise)
                };

                return generatePrefixes(inputParameters)
                    .then(newPrefixList => {

                        newPrefixList.options.monitorASns = oldPrefixList.options.monitorASns;

                        if (Object.keys(newPrefixList).length <= (Object.keys(oldPrefixList).length / 100) * this.prefixListDiffFailThreshold) {
                            throw new Error("Prefix list generation failed.");
                        }

                        const newPrefixesNotMergeable = [];
                        const uniquePrefixes = [...new Set(Object.keys(oldPrefixList).concat(Object.keys(newPrefixList)))]
                            .filter(prefix => ipUtils.isValidPrefix(prefix));
                        const asns = [...new Set(Object
                            .values(oldPrefixList)
                            .map(i => i.asn)
                            .concat(Object.keys((oldPrefixList.options || {}).monitorASns || {})))];

                        for (let prefix of uniquePrefixes) {
                            const oldPrefix = oldPrefixList[prefix];
                            const newPrefix = newPrefixList[prefix];

                            // Apply old description to the prefix
                            if (newPrefix && oldPrefix) {
                                newPrefixList[prefix] = oldPrefix;
                            }

                            // The prefix didn't exist
                            if (newPrefix && !oldPrefix) {
                                // The prefix is not RPKI valid
                                if (!newPrefix.valid) {
                                    // The prefix is not announced by a monitored ASn
                                    if (!newPrefix.asn.some(p => asns.includes(p))) {
                                        newPrefixesNotMergeable.push(prefix);
                                        delete newPrefixList[prefix];
                                    }
                                }
                            }
                        }

                        if (newPrefixesNotMergeable.length) {
                            this.logger.log({
                                level: 'info',
                                message: `The rules about ${newPrefixesNotMergeable.join(", ")} cannot be automatically added to the prefix list since their origin cannot be validated. They are not RPKI valid and they are not announced by a monitored AS. Add the prefixes manually if you want to start monitoring them.`
                            });
                        }

                        return newPrefixList;
                    });
            })
            .then(this.save)
            .then(() => {
                this.logger.log({
                    level: 'info',
                    message: `Prefix list updated.`
                });
            })
            .catch(error => {
                this.logger.log({
                    level: 'error',
                    message: error
                });
            });
    };

    setReGeneratePrefixList = () => {
        if (this.config.generatePrefixListEveryDays >= 1) {
            const refreshTimer = Math.ceil(this.config.generatePrefixListEveryDays) * 24 * 3600 * 1000;
            if (this.regeneratePrefixListTimer) {
                clearTimeout(this.regeneratePrefixListTimer);
            }
            this.regeneratePrefixListTimer = setTimeout(this._reGeneratePrefixList, refreshTimer);
        }
    };

}