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
import nodemailer from "nodemailer";
import emailTemplates from "./email_templates/emailTemplates";

export default class ReportEmail extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);
        this.emailTemplates = new emailTemplates(this.logger);
        this.templates = {};
        this.emailBacklog = [];

        if (!this.getUserGroup("default")) {
            this.enabled = false;
            this.logger.log({
                level: "error",
                message: "In notifiedEmails, for reportEmail, a group named 'default' is required for communications to the admin."
            });
        } else {

            this.transporter = nodemailer.createTransport(this.params.smtp);

            for (let channel of channels) {
                try {
                    this.templates[channel] = this.emailTemplates.getTemplate(channel);
                } catch (error) {
                    this.logger.log({
                        level: "error",
                        message: channel + " template cannot be loaded"
                    });
                }
            }

            if (Object.keys(this.templates).length === 0) {
                this.enabled = false;
                this.logger.log({
                    level: "error",
                    message: "Email templates cannot be associated to channels."
                });
            }

            setInterval(() => {
                const nextEmail = this.emailBacklog.pop();
                if (nextEmail) {
                    this._sendEmail(nextEmail);
                }
            }, 3000);
        }
    };


    getUserGroup = (group) => {
        const groups = this.params.notifiedEmails || this.params.userGroups;

        return groups[group] || groups["default"];
    };

    getEmails = (content) => {
        const users = content.data
            .map(item => {
                if (item.matchedRule) {
                    return item.matchedRule.group || "default";
                } else {
                    return false;
                }
            })
            .filter(item => !!item);

        try {
            return [...new Set(users)]
                .map(user => this.getUserGroup(user))
                .filter(item => !!item);
        } catch (error) {
            this.logger.log({
                level: "error",
                message: "Not all groups have an associated email address"
            });
        }

        return [];
    };

    getEmailText = (channel, content) => {
        const context = this.getContext(channel, content);
        const paths = JSON.parse(`[${context.paths}]`);
        context.paths = paths.length ? paths.join("\n") : "Disabled";
        return this.parseTemplate(this.templates[channel], context);
    };

    _sendEmail = (email) => {
        this.transporter
            .sendMail(email)
            .catch(error => {
                this.logger.log({
                    level: "error",
                    message: error
                });
            });
    };

    report = (channel, content) => {

        if (this.enabled) {
            const emailGroups = this.getEmails(content);

            for (let emails of emailGroups) {

                const text = this.getEmailText(channel, content);

                if (text) {
                    const to = emails.join(", ");
                    this.logger.log({
                        level: "info",
                        message: `[reportEmail] sending report to: ${to}`
                    });

                    this.emailBacklog.push({
                        from: this.params.senderEmail,
                        to,
                        subject: "BGP alert: " + channel,
                        text: text,
                        headers: {
                            "auto-submitted": "auto-generated"
                        }
                    });
                }
            }
        }
    };
}