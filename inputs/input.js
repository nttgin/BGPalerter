
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

import ipUtils from "../ipUtils";

export default class Input {

    constructor(config){
        this.prefixes = [];
        this.cache = {};
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

    getMonitoredLessSpecifics = () => {
        const prefixes = this.prefixes.sort((a, b) => {
            return ipUtils.sortByPrefixLength(a.prefix, b.prefix);
        });

        const lessSpecifics = [];

        lessSpecifics.push(prefixes.pop());


        for (let p1 of prefixes) {
             const p1b = ipUtils.getNetmask(p1.prefix);
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

    getMoreSpecificMatch = (prefix) => {

        for (let p of this.prefixes) {
            if (p.prefix === prefix) {
                return p;
            } else {
                if (!this.cache[p.prefix]) {
                    this.cache[p.prefix] = ipUtils.getNetmask(p.prefix);
                }
                const p2 = ipUtils.getNetmask(prefix);

                if (ipUtils.isSubnetBinary(this.cache[p.prefix], p2)) {
                    if (p.ignoreMorespecifics){
                        return null;
                    } else {
                        return p;
                    }
                }
            }
        }

        return null;
    };

}