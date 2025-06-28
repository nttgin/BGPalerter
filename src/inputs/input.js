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
import LongestPrefixMatch from "longest-prefix-match";

export default class Input {

    constructor(env) {
        this.prefixes = [];
        this.asns = [];
        this.config = env.config;
        this.storage = env.storage;
        this.logger = env.logger;
        this.callbacks = [];
        this.prefixListDiffFailThreshold = 50;
        this.index = new LongestPrefixMatch();

        // This is to load the prefixes after the application is booted
        setTimeout(() => {
            this.loadPrefixes()
                .then(() => this._change())
                .catch(error => {
                    this.logger.log({
                        level: "error",
                        message: error
                    });
                    console.log(error);
                    process.exit();
                });
        }, 200);
    };

    _isAlreadyContained = (prefix, lessSpecifics) => {
        let p1af, p1b;

        try {
            p1af = ipUtils.getAddressFamily(prefix);
            p1b = ipUtils.applyNetmask(prefix, p1af);
        } catch (error) {
            throw new Error(`${error.message}: ${prefix}`);
        }

        for (let p2 of lessSpecifics) {
            try {
                const p2af = ipUtils.getAddressFamily(p2.prefix);
                if (p1af === p2af && ipUtils.isSubnetBinary(ipUtils.applyNetmask(p2.prefix, p2af), p1b)) {
                    return true;
                }
            } catch (error) {
                throw new Error(`${error.message}: ${p2}`);
            }
        }

        return false;
    };

    onChange = (callback) => {
        this.callbacks.push(callback);
    };

    _change = () => {
        for (let item of this.asns) {
            item.group = [item.group].flat();
        }

        this.index = new LongestPrefixMatch();

        for (let item of this.prefixes) {
            item.group = [item.group].flat();
            this.index.addPrefix(item.prefix, {...item});
        }

        for (let call of this.callbacks) {
            call();
        }
    };

    getMonitoredLessSpecifics = () => {

        if (!this.prefixes.length) {
            return [];
        }

        const lessSpecifics = [];

        try {
            let prefixes = this.prefixes;
            lessSpecifics.push(prefixes[prefixes.length - 1]);

            for (let n = prefixes.length - 2; n >= 0; n--) {
                const p1 = prefixes[n];
                if (!this._isAlreadyContained(p1.prefix, lessSpecifics)) {
                    lessSpecifics.push(p1);
                }
            }
        } catch (error) {
            this.logger.log({
                level: "error",
                message: error.message
            });
        }

        return lessSpecifics;
    };

    getMonitoredMoreSpecifics = () => {
        throw new Error("The method getMonitoredMoreSpecifics MUST be implemented");
    };

    getMonitoredPrefixes = () => {
        throw new Error("The method getMonitoredPrefixes MUST be implemented");
    };


    _filterIgnoreMorespecifics = (i, prefix, includeIgnoredMorespecifics) => {
        return includeIgnoredMorespecifics
            || !i.ignoreMorespecifics
            || ipUtils._isEqualPrefix(i.prefix, prefix); // last piece says "or it is not a more specific"
    };

    getMoreSpecificMatches = (prefix, includeIgnoredMorespecifics = false) => {
        return this.index.getMatch(prefix, false)
            .filter(i => this._filterIgnoreMorespecifics(i, prefix, includeIgnoredMorespecifics))
            .map(i => ({...i}));
    };

    getMonitoredASns = () => {
        throw new Error("The method getMonitoredASns MUST be implemented");
    };

    loadPrefixes = () => {
        throw new Error("The method loadPrefixes MUST be implemented");
    };

    save = (data) => {
        throw new Error("The method save MUST be implemented");
    };

    retrieve = () => {
        throw new Error("The method retrieve MUST be implemented");
    };

    async generate() {
        try {
            const answer = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "continue",
                    message: "The file prefixes.yml cannot be loaded. Do you want to auto-configure BGPalerter?",
                    default: true
                }
            ]);
            if (!answer.continue) throw new Error("Nothing to monitor.");

            const nextAnswers = await inquirer.prompt([
                {
                    type: "input",
                    name: "asns",
                    message: "Which Autonomous System(s) you want to monitor? (comma-separated, e.g., 2914,3333)",
                    default: "",
                    validate: function (value) {
                        const asns = value.split(",").filter(i => i !== "" && !isNaN(i));
                        return asns.length > 0;
                    }
                },

                {
                    type: "confirm",
                    name: "m",
                    message: "Do you want to be notified when your AS is announcing a new prefix?",
                    default: true
                },

                {
                    type: "confirm",
                    name: "upstreams",
                    message: "Do you want to be notified when a new upstream AS appears in a BGP path?",
                    default: true
                },
                {
                    type: "confirm",
                    name: "downstreams",
                    message: "Do you want to be notified when a new downstream AS appears in a BGP path?",
                    default: true
                }
            ]);

            const asns = nextAnswers.asns.split(",");

            const inputParameters = {
                asnList: asns,
                exclude: [],
                excludeDelegated: true,
                prefixes: null,
                monitoredASes: nextAnswers.m ? asns : [],
                debug: false,
                historical: false,
                group: null,
                append: false,
                logger: null,
                upstreams: !!nextAnswers.upstreams,
                downstreams: !!nextAnswers.downstreams,
                getCurrentPrefixesList: () => {
                    return this.retrieve();
                }
            };

            const result = await generatePrefixes(inputParameters);
            await this.save(result);
            console.log("Done!");
        } catch (error) {
            console.log(error);
            this.logger.log({
                level: "error",
                message: error
            });
            process.exit();
        }
    };

    _reGeneratePrefixList = () => {
        this.logger.log({
            level: "info",
            message: "Updating prefix list"
        });

        this.setReGeneratePrefixList();

        return this.retrieve()
            .then(oldPrefixList => {
                const inputParameters = oldPrefixList.options.generate;

                if (!inputParameters) {
                    throw new Error("The prefix list cannot be refreshed because it was not generated automatically.");
                }

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
                                level: "info",
                                message: `The rules about ${newPrefixesNotMergeable.join(", ")} cannot be automatically added to the prefix list since their origin cannot be validated. They are not RPKI valid and they are not announced by a monitored AS. Add the prefixes manually if you want to start monitoring them.`
                            });
                        }

                        return newPrefixList;
                    });
            })
            .then(this.save)
            .then(() => {
                this.logger.log({
                    level: "info",
                    message: `Prefix list updated.`
                });
            })
            .catch(error => {
                this.logger.log({
                    level: "error",
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