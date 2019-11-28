
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

import fs from "fs";
import path from "path";

const templateHijack = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Monitored prefix:     ${prefix}\n\
Prefix Description:   ${description}\n\
Usually announced by: ${asn}\n\
Event type:           ${type}\n\
Now announced by:     ${neworigin}\n\
Now announced with:   ${newprefix}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
Detected by peers:    ${peers}\n\
See in BGPlay:        ${bgplay}\n\
\n\
Top ${pathNumber} most used AS paths:\n\
${paths}';

const templateNewPrefix = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Monitored prefix:     ${prefix}\n\
Prefix Description:   ${description}\n\
Usually announced by: ${asn}\n\
Event type:           ${type}\n\
Detected new prefix:  ${newprefix}\n\
Announced by:         ${neworigin}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
Detected by peers:    ${peers}\n\
See in BGPlay:        ${bgplay}';

const templatePath = '${summary}';

const templateSoftwareUpdate = '${summary}';

const templateVisibility = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Monitored prefix:     ${prefix}\n\
Prefix Description:   ${description}\n\
Prefix origin:        ${asn}\n\
Event type:           ${type}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
Detected by peers:    ${peers}\n\
See in BGPlay:        ${bgplay}';

const templateMisconfiguration = '${summary}';


export default class emailTemplates {

    constructor(logger) {
        const directory = 'reports/email_templates/';
        const templateFiles = [
            {
                channel: 'hijack',
                content: templateHijack
            },
            {
                channel: 'newprefix',
                content: templateNewPrefix
            },
            {
                channel: 'path',
                content: templatePath
            },
            {
                channel: 'software-update',
                content: templateSoftwareUpdate
            },
            {
                channel: 'visibility',
                content: templateVisibility
            },
            {
                channel: 'misconfiguration',
                content: templateMisconfiguration
            }
        ];

        this.indexedFiles = {};

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory,  { recursive: true });
        }

        templateFiles
            .forEach(template => {
                try {
                    const file = path.resolve(directory, template.channel + '.txt');

                    if (fs.existsSync(file)) {
                        this.indexedFiles[template.channel] = fs.readFileSync(file, 'utf8');
                    } else {
                        fs.writeFileSync(file, template.content);
                        this.indexedFiles[template.channel] = template.content;
                    }
                } catch (error) {
                    logger.log({
                        level: 'error',
                        message: 'Email template: ' + error
                    });
                }
            });
    }

    getTemplate = (channel) => {
        return this.indexedFiles[channel];
    };

};