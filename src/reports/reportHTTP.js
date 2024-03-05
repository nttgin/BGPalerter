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
import fs from "fs";


const _context = {
    buffer: [],
    logger: null,
    axios: null,
    started: false
}

function processEvent() {
    const requestParams = _context.buffer.shift(); 
    if (!requestParams) {
        setTimeout(processEvent, 50);
        return;
    }

    _context.logger.log({
        level: 'info',
        message: `[ReportHTTP] sending report to: ${requestParams.url} [${_context.buffer.length} msgs in buffer]`
    });

    const before = new Date();
    _context.axios(requestParams)
        .then(response => {
            const after = new Date();
            // Log or handle the detailed error message as needed
            _context.logger.log({
                level: 'info',
                message: `[ReportHTTP] response received: ${response.status} after ${after - before} ms from body  ${JSON.stringify(requestParams.data)}`
            })
        })
        .catch((error) => {
            let errorMessage = 'An unknown error occurred';
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const statusCode = error.response.status;
                const errorDetails = error.response.data || 'No additional error information';
                errorMessage = `Request failed with status code ${statusCode}: ${errorDetails}`;
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                errorMessage = 'The request was made but no response was received';
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = `Error setting up the request: ${error.message} ${JSON.stringify(requestParams)}`;
            }
            // Log or handle the detailed error message as needed
            _context.logger.log({
                level: 'error',
                message: '[ReportHTTP] ' + errorMessage
            })
        })
        .finally(() => {
            setTimeout(processEvent, 50);
        });
}


export default class ReportHTTP extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);

        this.name = "reportHTTP" || this.params.name;
        this.enabled = true;
        this.method = (this.params?.method ?? "post").toLowerCase();

        if (!["post", "put", "patch", "delete"].includes(this.method)) {
            this.logger.log({
                level: 'error',
                message: `${this.name} is not enabled: the configured HTTP method is not valid`
            });
            this.enabled = false;
        }

        if (!this.getUserGroup("default")) {
            this.logger.log({
                level: 'error',
                message: `${this.name} is not enabled: no default group defined`
            });
            this.enabled = false;
        }

        this.headers = this.params.headers || {};
        if (this.params.isTemplateJSON) {
            this.headers["Content-Type"] = "application/json";
        }
    }

    getUserGroup = (group) => {
        const groups = this.params.hooks || this.params.userGroups || {};

        return groups[group] || groups["default"];
    };

    getTemplate = (group, channel, content) => {
        return this.params.templates[channel] || this.params.templates["default"];
    };

    _sendHTTPMessage = (group, channel, content) => {
        const url = this.getUserGroup(group);
        // console.log(`[${this.name}] sending report to: ${url}`)
        if (url) {
            const context = this.getContext(channel, content);

            if (this.params.showPaths > 0 && context.pathNumber > 0) {
                context.summary = `${context.summary}. Top ${context.pathNumber} most used AS paths: ${context.paths}.`;
            }
            const blob = this.parseTemplate(this.getTemplate(group, channel, content), context);

            const requestParams = {
                url,
                method: this.method,
                headers: this.headers,
                data: (this.params.isTemplateJSON) ? JSON.parse(blob) : blob
            };

            _context.buffer.push(requestParams);

            if (!_context.started) {
                _context.logger = this.logger;
                _context.axios = this.axios;
                _context.started = true;
                setTimeout(processEvent, 50);
            }
        }
    };

    randomKey() {
        let key = ''
        for(let i = 0; i < 5; i++) {
            key += (~~(Math.random() * 1000000)).toString(26)
        }
        return key;
    }

    _writeDataOnFile = (group, channel, content) => {
        try {
            const before = new Date();
            const timestamp = `${content.earliest}-${content.latest}`;
            const alertsDirectory = "alerts";
            const filename = `${alertsDirectory}/${timestamp}-${this.randomKey()}.json`;
            const context = this.getContext(channel, content);
            if (this.params.showPaths > 0 && context.pathNumber > 0) {
                context.summary = `${context.summary}. Top ${context.pathNumber} most used AS paths: ${context.paths}.`;
            }
            const blob = this.parseTemplate(this.getTemplate(group, channel, content), context);
            const data = (this.params.isTemplateJSON) ? JSON.parse(blob) : blob;
            if (!fs.existsSync(alertsDirectory)) {
                fs.mkdirSync(alertsDirectory, { recursive: true });
            }
            fs.writeFileSync(filename, JSON.stringify(data));
            const after = new Date();
            this.logger.log({
                level: 'info',
                message: `Message sent to alerts folder after ${after - before}ms of processing`
            });
        } catch (error) {
            this.logger.log({
                level: 'error',
                message: error
            });
        }
    };

    report = (channel, content) => {
        if (this.enabled) {
            let groups = content.data.map(i => i.matchedRule.group).filter(i => i != null);

            groups = (groups.length) ? [...new Set(groups)] : ["default"];

            for (let group of groups) {
                // this._sendHTTPMessage(group, channel, content);
                this._writeDataOnFile(group, channel, content);
            }
        }
    };
}