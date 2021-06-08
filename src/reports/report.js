
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

import moment from "moment";
import brembo from "brembo";
import axios from "axios";
import axiosEnrich from "../utils/axiosEnrich";

export default class Report {
    constructor(channels, params, env) {

        this.config = env.config;
        this.logger = env.logger;
        this.pubSub = env.pubSub;
        this.params = params;
        this.enabled = true;

        for (let channel of channels){
            env.pubSub.subscribe(channel, (content, message) => {
                return this.report(message, content);
            });
        }

        this.axios = axiosEnrich(axios,
            (!this.params.noProxy && env.agent) ? env.agent : null,
            `${env.clientId}/${env.version}`);
    }

    getBGPlayLink = (prefix, start, end, instant = null, rrcs = [0,1,2,5,6,7,10,11,13,14,15,16,18,20]) => {
        const bgplayTimeOffset = 5 * 60; // 5 minutes
        return brembo.build("https://stat.ripe.net/", {
            path: ["widget", "bgplay"],
            params: {
                "w.resource": prefix,
                "w.ignoreReannouncements": true,
                "w.starttime": moment(start).utc().unix() - bgplayTimeOffset,
                "w.endtime": moment(end).utc().unix(),
                "w.rrcs": rrcs.join(","),
                "w.instant": null,
                "w.type": "bgp",

            }
        }).replace("?", "#");
    };

    getContext = (channel, content) => {
        try {
            let context = {
                summary: content.message,
                earliest: moment(content.earliest).utc().format("YYYY-MM-DD HH:mm:ss"),
                latest: moment(content.latest).utc().format("YYYY-MM-DD HH:mm:ss"),
                channel,
                type: content.origin,
            };

            let matched = null;
            let pathsCount = {};
            let sortedPathIndex;

            if (this.params.showPaths > 0) {
                content.data
                    .filter(i => !!i.matchedMessage && !!i.matchedMessage.path)
                    .map(i => JSON.stringify(i.matchedMessage.path.getValues().slice(1)))
                    .forEach(path => {
                        if (!pathsCount[path]) {
                            pathsCount[path] = 0;
                        }
                        pathsCount[path]++;
                    });


                sortedPathIndex = Object.keys(pathsCount)
                    .map(key => [key, pathsCount[key]]);

                sortedPathIndex.sort((first, second) => second[1] - first[1]);
                context.pathNumber = Math.min(this.params.showPaths, sortedPathIndex.length);
                context.paths = sortedPathIndex
                    .slice(0, this.params.showPaths)
                    .map(i => i[0])
                    .join(",");
            } else {
                context.pathNumber = 0;
                context.paths = "";
            }

            switch(channel){
                case "hijack":
                    matched = content.data[0].matchedRule;
                    context.prefix = matched.prefix;
                    context.description = matched.description;
                    context.asn = matched.asn.toString();
                    context.peers = [...new Set(content.data.map(alert => alert.matchedMessage.peer))].length;
                    context.neworigin = content.data[0].matchedMessage.originAS;
                    context.newprefix = content.data[0].matchedMessage.prefix;
                    context.bgplay = this.getBGPlayLink(matched.prefix, content.earliest, content.latest);

                    break;

                case "visibility":
                    matched = content.data[0].matchedRule;
                    context.prefix = matched.prefix;
                    context.description = matched.description;
                    context.asn = matched.asn.toString();
                    context.peers = [...new Set(content.data.map(alert => alert.matchedMessage.peer))].length;
                    context.bgplay = this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
                    break;

                case "newprefix":
                    matched = content.data[0].matchedRule;
                    context.prefix = matched.prefix;
                    context.description = matched.description;
                    context.asn = matched.asn.toString();
                    context.peers = [...new Set(content.data.map(alert => alert.matchedMessage.peer))].length;
                    context.neworigin = content.data[0].matchedMessage.originAS;
                    context.newprefix = content.data[0].matchedMessage.prefix;
                    context.bgplay = this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
                    break;

                case "software-update":
                    break;

                case "path":
                    break;

                case "misconfiguration":
                    context.asn = content.data[0].matchedRule.asn.toString();
                    break;

                case "rpki":
                    matched = content.data[0].matchedRule;
                    context.asn = (matched.asn || "").toString();
                    context.prefix = matched.prefix || content.data[0].matchedMessage.prefix;
                    context.description = matched.description;
                    break;

                default:
                    matched = content.data[0].matchedRule;
                    context.prefix = matched.prefix;
                    context.description = matched.description;
                    context.asn = matched.asn.toString();
            }

            return context;

        } catch (error) { // This MUST never happen. But if it happens we need do send a basic alert anyway and don't crash
            this.logger.log({
                level: 'error',
                message: `It was not possible to generate a context: ${error}`
            });

            return {
                summary: content.message
            }
        }
    };

    parseTemplate = (template, context) => {
        return template.replace(/\${([^}]*)}/g, (r,k)=>context[k]);
    };

    report = (message, content) => {
        throw new Error('The method report must be implemented');
    };

    getUserGroup = (group) => {
        throw new Error('The method getUserGroup must be implemented');
    };

}
