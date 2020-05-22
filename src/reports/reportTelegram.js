/*
 * 	BSD 3-Clause License
 *
 * Copyright (c) 2020, denisix(at)gmail(dot)com
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
import axios from "axios";

export default class ReportTelegram extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);

        this.name = "reportTelegram" || this.params.name;
        this.enabled = true;

        if (!this.params.botToken || !this.params.chatId) {
            this.logger.log({
                level: 'error',
                message: `${this.name} reporting is not enabled: no botToken/chatId provided`
            });
            this.enabled = false;
        }
    }

    _sendTelegramMessage = (botToken, chat_id, text) => {
        axios({
            url: `https://api.telegram.org/bot${botToken}/sendMessage`,
            method: 'POST',
            responseType: "json",
            data: {
                chat_id,
                text,
                'parse_mode': 'HTML',
                disable_web_page_preview: true,
            }
        })
            .catch(message => {
                this.logger.log({
                    level: 'error',
                    message
                });
            })
    };

    report = (message, content) => {
        if (!this.enabled) return
        if (this.params.showPaths > 0) {
            content.message += `${content.message}.\n\nTop ${context.pathNumber} most used AS paths:\n${context.paths}`;
        }
        this._sendTelegramMessage(this.params.botToken, this.params.chatId, `<strong>${message}</strong>\n${content.message}`);
    }
}
