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

export default class InputYml extends Input {

    constructor(config){
        super(config);
        this.prefixes = [];

        if (!config.monitoredPrefixesFiles || config.monitoredPrefixesFiles.length === 0){
            throw new Error("The monitoredPrefixesFiles key is missing in the config file");
        }

        for (let prefixesFile of config.monitoredPrefixesFiles){
            const monitoredPrefixesFile = yaml.safeLoad(fs.readFileSync('./' + prefixesFile, 'utf8'));

            const monitoredPrefixes = Object.keys(monitoredPrefixesFile)
                .map(i => {
                    return Object.assign({
                        prefix: i,
                        user: 'default'
                    }, monitoredPrefixesFile[i])
                });

            this.prefixes = this.prefixes.concat(monitoredPrefixes);
        }

    };

    getMonitoredMoreSpecifics = () => {
        return this.prefixes.filter(p => !p.ignoreMorespecifics);
    };

    getMonitoredPrefixes = () => {
        return this.prefixes;
    };

}