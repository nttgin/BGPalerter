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

import Report from "./report";
import brembo from "brembo";
import fs from "fs";
import moment from "moment";
import nodemailer from "nodemailer";
import path from "path";

export default class ReportEmail extends Report {

    constructor(channels,params, env) {
        super(channels, params, env);

        this.templates = {};
        this.emailBacklog = [];

        if (!this.params.notifiedEmails || !Object.keys(this.params.notifiedEmails).length) {
            this.logger.log({
                level: 'error',
                message: "Email reporting is not enabled: no group is defined"
            });

        } else {

            if (!this.params.notifiedEmails["default"]) {
                this.logger.log({
                    level: 'error',
                    message: "In notifiedEmails, for reportEmail, a group named 'default' is required for communications to the admin."
                });
            }

            this.transporter = nodemailer.createTransport(this.params.smtp);

            for (let channel of channels) {
                try {
                    const file = path.resolve('reports/email_templates', `${channel}.txt`);
                    this.templates[channel] = fs.readFileSync(file, "utf8");
                } catch (error) {
                    this.logger.log({
                        level: 'error',
                        message: channel + ' template cannot be loaded'
                    })
                }
            }

            setInterval(() => {
                const nextEmail = this.emailBacklog.pop();
                if (nextEmail) {
                    this._sendEmail(nextEmail);
                }
            }, 3000);
        }
    }

    getEmails = (content) => {
        const users = content.data
            .map(item => {
                if (item.matchedRule && item.matchedRule.group){
                    return item.matchedRule.group;
                } else {
                    return false;
                }
            })
            .filter(item => !!item);

        try {
            return [...new Set(users)]
                .map(user => {
                    return this.params.notifiedEmails[user];
                });
        } catch (error) {
            this.logger.log({
                level: 'error',
                message: 'Not all groups have an associated email address'
            });
        }

        return [];
    };

    _getBGPlayLink = (prefix, start, end, instant = null, rrcs = [0,1,2,5,6,7,10,11,13,14,15,16,18,20]) => {
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

    getEmailText = (channel, content) => {
        let context = {
            summary: content.message,
            earliest: moment(content.earliest).utc().format("YYYY-MM-DD hh:mm:ss"),
            latest: moment(content.latest).utc().format("YYYY-MM-DD hh:mm:ss"),
            channel,
            type: content.origin,
        };

        let matched = null;

        switch(channel){
            case "hijack":
                matched = content.data[0].matchedRule;
                context.prefix = matched.prefix;
                context.description = matched.description;
                context.asn = matched.asn.toString();
                context.peers = [...new Set(content.data.map(alert => alert.matchedMessage.peer))].length;
                context.neworigin = content.data[0].matchedMessage.originAS;
                context.newprefix = content.data[0].matchedMessage.prefix;
                context.bgplay = this._getBGPlayLink(matched.prefix, content.earliest, content.latest);
                break;

            case "visibility":
                matched = content.data[0].matchedRule;
                context.prefix = matched.prefix;
                context.description = matched.description;
                context.asn = matched.asn.toString();
                context.peers = [...new Set(content.data.map(alert => alert.matchedMessage.peer))].length;
                context.bgplay = this._getBGPlayLink(matched.prefix, content.earliest, content.latest);
                break;

            case "newprefix":
                matched = content.data[0].matchedRule;
                context.prefix = matched.prefix;
                context.description = matched.description;
                context.asn = matched.asn.toString();
                context.peers = [...new Set(content.data.map(alert => alert.matchedMessage.peer))].length;
                context.neworigin = content.data[0].matchedMessage.originAS;
                context.newprefix = content.data[0].matchedMessage.prefix;
                context.bgplay = this._getBGPlayLink(matched.prefix, content.earliest, content.latest);
                break;

            case "software-update":
                break;

            case "path":
                break;

            default:
                return false;
        }

        return (this.templates[channel]) ? this.templates[channel].replace(/\${([^}]*)}/g, (r,k)=>context[k]) : false;
    };

    _sendEmail = (email) => {
        if (this.transporter) {
            this.transporter
                .sendMail(email)
                .catch(error => {
                    this.logger.log({
                        level: 'error',
                        message: error
                    });
                })
        }
    };

    report = (channel, content) => {

        if (Object.keys(this.templates).length > 0) {

            const emailGroups = this.getEmails(content);

            for (let emails of emailGroups) {

                const text = this.getEmailText(channel, content);

                if (text) {
                    this.emailBacklog.push({
                        from: this.params.senderEmail,
                        to: emails.join(', '),
                        subject: 'BGP alert: ' + channel,
                        text: text
                    });
                }
            }

        }
    }
}