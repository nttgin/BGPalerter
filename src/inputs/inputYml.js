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

import yaml from "js-yaml";
import fs from "fs";
import Input from "./input";
import ipUtils from "ip-sub";
import { AS } from "../model";

export default class InputYml extends Input {

    constructor(env){
        super(env);
        this.prefixes = [];
        this.asns = [];

        if (!this.config.monitoredPrefixesFiles || this.config.monitoredPrefixesFiles.length === 0) {
            throw new Error("The monitoredPrefixesFiles key is missing in the config file");
        }

        this.watcherSet = false;
    };

    loadPrefixes = () => {
        this.defaultPrefixFile = this.config.volume + this.config.monitoredPrefixesFiles[0];
        if (!fs.existsSync(this.defaultPrefixFile)) {
            return this.generate()
                .then(() => this._loadPrefixes());
        }

        return this._loadPrefixes();
    };

    _watchPrefixFile = (file) => {
        if (!this.watcherSet) {
            this.watcherSet = true;

            fs.watchFile(file, () => {
                if (this._watchPrefixFileTimer) {
                    clearTimeout(this._watchPrefixFileTimer)
                }
                this._watchPrefixFileTimer = setTimeout(() => {
                    this.prefixes = [];
                    this.asns = [];
                    this._loadPrefixes()
                        .then(() => {
                            return this._change();
                        })
                        .catch(error => {
                            this.logger.log({
                                level: 'error',
                                message: error
                            });
                        });
                }, 5000);
            });
        }
    };

    _loadPrefixes = () =>
        new Promise((resolve, reject) => {
            const uniquePrefixes = {};
            const uniqueAsns = {};

            for (let prefixesFile of this.config.monitoredPrefixesFiles) {

                const file = this.config.volume + prefixesFile;
                let monitoredPrefixesFile = {};
                let fileContent;

                if (fs.existsSync(file)) {
                    fileContent = fs.readFileSync(file, 'utf8');
                    try {
                        monitoredPrefixesFile = yaml.safeLoad(fileContent) || {};
                        this._watchPrefixFile(file);
                    } catch (error) {
                        reject(new Error("The file " + prefixesFile + " is not valid yml: " + error.message.split(":")[0]));
                        return;
                    }

                    if (Object.keys(monitoredPrefixesFile).length === 0) {
                        reject(new Error("No prefixes to monitor in " + prefixesFile + ". Please read https://github.com/nttgin/BGPalerter/blob/master/docs/prefixes.md"));
                        return;
                    }

                    if (this.validate(monitoredPrefixesFile)) {
                        if (monitoredPrefixesFile.options) {

                            this.options = monitoredPrefixesFile.options;

                            if (monitoredPrefixesFile.options.monitorASns) {
                                this.asns = Object
                                    .keys(monitoredPrefixesFile.options.monitorASns)
                                    .map(asn => {
                                        if (uniqueAsns[asn]) {
                                            reject(new Error("Duplicate entry for monitored AS " + asn));
                                            return;
                                        }
                                        uniqueAsns[asn] = true;
                                        return Object.assign({
                                            asn: new AS(asn),
                                            group: 'default'
                                        }, monitoredPrefixesFile.options.monitorASns[asn]);
                                    });
                            }
                        }

                        const monitoredPrefixes = Object
                            .keys(monitoredPrefixesFile)
                            .filter(i => i !== "options")
                            .map(i => {
                                if (uniquePrefixes[i]) {
                                    reject(new Error("Duplicate entry for " + i));
                                    return;
                                }
                                uniquePrefixes[i] = true;
                                monitoredPrefixesFile[i].asn = new AS(monitoredPrefixesFile[i].asn);

                                return Object.assign({
                                    prefix: i,
                                    group: 'default',
                                    ignore: false,
                                    excludeMonitors: [],
                                    includeMonitors: [],
                                }, monitoredPrefixesFile[i])
                            })
                            .filter(i => i !== null);

                        this.prefixes = this.prefixes.concat(monitoredPrefixes);
                    }

                }
            }

            this.prefixes.sort((a, b) => {
                return ipUtils.sortByPrefixLength(b.prefix, a.prefix);
            });

            resolve(true);
        });

    validate = (fileContent) => {
        let prefixesError = [];
        let optionsError = [];

        const options = fileContent.options;

        if (options && options.monitorASns) {
            optionsError = Object
                .keys(options.monitorASns)
                .map(asn => {
                    if (!new AS(asn).isValid()) {
                        return "Not a valid AS number in monitorASns";
                    }
                });
        }

        prefixesError = Object
            .keys(fileContent)
            .filter(i => i !== "options")
            .map(prefix => {
                const item = fileContent[prefix];
                let asns;

                if (!prefix || !ipUtils.isValidPrefix(prefix)) {
                    return "Not a valid prefix: " + prefix;
                }


                if (this.config.environment === "research") {
                    item.asn = item.asn || 0;
                }
                if (["string", "number"].includes(typeof(item.asn))) {
                    asns = [item.asn];
                } else if (item.asn instanceof Array) {
                    asns = item.asn;
                } else {
                    return "Not a valid AS number for: " + prefix;
                }


                if (!new AS(asns).isValid()) {
                    return "Not a valid AS number for: " + prefix;
                }

                if (!["string", "number"].includes(typeof(item.description))) {
                    return "Not a valid description for: " + prefix;
                }

                if (typeof(item.ignoreMorespecifics) !== "boolean") {
                    return "Not a valid ignoreMorespecifics value for: " + prefix;
                }

                if (item.ignore !== undefined && typeof(item.ignore) !== "boolean") {
                    return "Not a valid ignore value for: " + prefix;
                }

                if (item.includeMonitors !== undefined && item.excludeMonitors !== undefined) {
                    return "You can define only one of includeMonitor or excludeMonitor for: " + prefix;

                }

                if (item.excludeMonitors !== undefined && !Array.isArray(item.excludeMonitors)) {
                    return "Not a valid excludeMonitor value for: " + prefix;
                }

                if (item.includeMonitors !== undefined && !Array.isArray(item.includeMonitors)) {
                    return "Not a valid includeMonitor value for: " + prefix;
                }

                if (item.path) {
                    ((item.path.length) ? item.path : [item.path])
                        .map(rule => {
                            if (!rule.matchDescription){
                                return "No matchDescription set";
                            }
                            this._validateRegex(rule.match);
                            this._validateRegex(rule.notMatch);
                            if (rule.maxLength && !(typeof(rule.maxLength) == "number" && rule.maxLength > 1)) {
                                return "Not valid maxLength";
                            }

                            if (rule.minLength && !(typeof(rule.minLength) == "number" && rule.minLength > 1)) {
                                return "Not valid minLength";
                            }
                        })

                }

                return null;
            });

        const errors = [...prefixesError, ...optionsError].filter(i => i != null);

        errors
            .map(error => {
                throw new Error(error);
            });

        return errors.length === 0;
    };

    _validateRegex = (regex) => {
        if (regex) {
            try {
                new RegExp(regex);
            } catch (e) {
                return "Not valid Path regex" + regex;
            }
        }

    };

    getMonitoredMoreSpecifics = () => {
        return this.prefixes.filter(p => !p.ignoreMorespecifics);
    };

    getMonitoredPrefixes = () => {
        return this.prefixes;
    };

    getMonitoredASns = () => {
        return this.asns;
    };

    save = (content) =>
        new Promise((resolve, reject) => {
            if (content && typeof(content) === "object" && Object.keys(content).length > 0) {
                try {
                    fs.writeFileSync(this.defaultPrefixFile, yaml.dump(content));
                    resolve();
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(new Error("Empty or not valid prefix list"));
            }
        });

    retrieve = () =>
        new Promise((resolve, reject) => {
            const prefixes = {};
            for (let rule of this.prefixes) {
                const prefix = rule.prefix;
                prefixes[prefix] = {
                    asn: rule.asn.getValue(),
                    description: rule.description,
                    group: rule.group,
                    ignore: rule.ignore,
                    ignoreMorespecifics: rule.ignoreMorespecifics,
                };

                if (rule.excludeMonitors.length) prefixes[prefix].excludeMonitors = rule.excludeMonitors;
                if (rule.includeMonitors.length) prefixes[prefix].includeMonitors = rule.includeMonitors;
            }


            const monitorASns = {};
            for (let asnRule of this.asns) {
                monitorASns[asnRule.asn.getValue()] = {
                    group: asnRule.group
                };
            }

            const options = Object.assign({}, this.options, { monitorASns });

            resolve(JSON.parse(JSON.stringify({ ...prefixes, options })));
        });
}