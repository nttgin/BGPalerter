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

import ReportHTTP from "./reportHTTP";

export default class reportTelegram extends ReportHTTP {

    constructor(channels, params, env) {
        const hooks = {};

        for (let userGroup in params.chatIds) {
            hooks[userGroup] = params.botUrl;
        }
        hooks["default"] = params.botUrl;

        const telegramParams = {
            headers: {},
            isTemplateJSON: true,
            showPaths: params.showPaths,
            hooks: hooks,
            name: "reportTelegram",
            templates: {}
        };

        super(channels, telegramParams, env);
        this.chatIds = params.chatIds;

        if (!params.botUrl) {
            this.logger.log({
                level: 'error',
                message: `${this.name} reporting is not enabled: no botUrl provided`
            });
            this.enabled = false;
        }

        if (!params.chatIds || !params.chatIds["default"]) {
            this.logger.log({
                level: 'error',
                message: `${this.name} reporting is not enabled: no default chat id provided`
            });
            this.enabled = false;
        }
    };

    getTemplate = (group, channel, content) => {
        return JSON.stringify({
            "chat_id": this.chatIds[group] || this.chatIds["default"],
            "text": "${summary}",
            "parse_mode": 'HTML',
            "disable_web_page_preview": true
        });
    };
}