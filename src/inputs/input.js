
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

export default class Input {

    constructor(config){
        this.prefixes = [];
        this.asns = [];
        this.cache = {};
        this.config = config;
        this.callbacks = [];

        setTimeout(() => {
            this.loadPrefixes()
                .then(() => {
                    this._change();
                })
                .catch(error => {
                    console.log(error);
                    process.exit();
                });
        }, 200);

    };

    _isAlreadyContained = (prefix, lessSpecifics) => {
        const p1b = ipUtils.getNetmask(prefix);

        for (let p2 of lessSpecifics) {
            const p2b = ipUtils.getNetmask(p2.prefix);

            if (ipUtils.isSubnetBinary(p2b, p1b)) {
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
                if (!this.cache[p.prefix]) {
                    this.cache[p.prefix] = ipUtils.getNetmask(p.prefix);
                }
                const p2 = ipUtils.getNetmask(prefix);

                if (ipUtils.isSubnetBinary(this.cache[p.prefix], p2)) {
                    if (includeIgnoredMorespecifics || !p.ignoreMorespecifics) {
                        return p;
                    } else {
                        return null;
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
                            const generatePrefixes = require("../generatePrefixesList");
                            const asns = answer.asns.split(",");
                            return generatePrefixes(
                                asns,
                                "prefixes.yml",
                                [],
                                answer.i,
                                null,
                                answer.m ? asns : []
                            );
                        });
                } else {
                    throw new Error("Nothing to monitor.");
                }
            });


    };

}