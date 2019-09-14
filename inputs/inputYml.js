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
import ipUtils from "../ipUtils";
import { AS, Path } from "../model";


export default class InputYml extends Input {

    constructor(config){
        super(config);
        this.prefixes = [];

        if (!config.monitoredPrefixesFiles || config.monitoredPrefixesFiles.length === 0){
            throw new Error("The monitoredPrefixesFiles key is missing in the config file");
        }

        const uniquePrefixes = {};
        for (let prefixesFile of config.monitoredPrefixesFiles){
            const monitoredPrefixesFile = yaml.safeLoad(fs.readFileSync('./' + prefixesFile, 'utf8'));

            if (this.validate(monitoredPrefixesFile)) {

                const monitoredPrefixes = Object
                    .keys(monitoredPrefixesFile)
                    .map(i => {
                        if (uniquePrefixes[i]){
                            throw new Error("Duplicate entry for " + i);
                        }
                        uniquePrefixes[i] = true;
                        monitoredPrefixesFile[i].asn = new AS(monitoredPrefixesFile[i].asn);

                        return Object.assign({
                            prefix: i,
                            user: 'default'
                        }, monitoredPrefixesFile[i])
                    })
                    .filter(i => i !== null);

                this.prefixes = this.prefixes.concat(monitoredPrefixes);
            }
        }

        this.prefixes = this.prefixes.sort((a, b) => {
            return ipUtils.sortByPrefixLength(b.prefix, a.prefix);
        });

    };

    validate = (fileContent) => {
        const errors = Object
            .keys(fileContent)
            .map(prefix => {
                const item = fileContent[prefix];
                let asns;

                if (!prefix || !ipUtils.isValidPrefix(prefix)){
                    return "Not a valid prefix: " + prefix;
                }

                if (["string", "number"].includes(typeof(item.asn))) {
                    asns = [item.asn];
                } else if (item.asn instanceof Array) {
                    asns = item.asn;
                } else {
                    return "Not a valid AS number for: " + prefix;
                }

                if (asns.some(asn => !asn || !new AS(asn).isValid())){
                    return "Not a valid AS number for: " + prefix;
                }

                if (!["string", "number"].includes(typeof(item.description))){
                    return "Not a valid description for: " + prefix;
                }

                if (typeof(item.ignoreMorespecifics) !== "boolean"){
                    return "Not a valid ignoreMorespecifics value for: " + prefix;
                }

                return null;
            })
            .filter(i => i != null)
            .map(error => {
                throw new Error(error);
            });

        return errors.length === 0;
    };

    getMonitoredMoreSpecifics = () => {
        return this.prefixes.filter(p => !p.ignoreMorespecifics);
    };

    getMonitoredPrefixes = () => {
        return this.prefixes;
    };

}