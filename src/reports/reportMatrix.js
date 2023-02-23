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
import { v4 as uuidv4 } from 'uuid';

export default class reportMatrix extends ReportHTTP {

    constructor(channels, params, env) {
        const hooks = {};
        const transactionId = uuidv4();

        for (let userGroup in params.roomIds) {
            hooks[userGroup] = params.homeserverUrl + "/_matrix/client/v3/rooms/" + encodeURIComponent(params.roomIds[userGroup]) + "/send/m.room.message/" + transactionId;
        }
        hooks["default"] = params.homeserverUrl + "/_matrix/client/v3/rooms/" + encodeURIComponent(params.roomIds["default"]) + "/send/m.room.message/" + transactionId;


        const matrixParams = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + params.accessToken
            },
            isTemplateJSON: true,
            showPaths: params.showPaths,
            hooks: hooks,
            name: "reportMatrix",
            method: "put",
            templates: {}
        };

        super(channels, matrixParams, env);
        this.roomIds = params.roomIds;

        if (!params.homeserverUrl || !params.accessToken) {
            this.logger.log({
                level: 'error',
                message: `${this.name} reporting is not enabled: homeserverUrl and accessToken are required`
            });
            this.enabled = false;
        }

        if (!params.roomIds || !params.roomIds["default"]) {
            this.logger.log({
                level: 'error',
                message: `${this.name} reporting is not enabled: no default room id provided`
            });
            this.enabled = false;
        }
    };

    getTemplate = (group, channel, content) => {
        return JSON.stringify({
            "msgtype": "m.text",
            "body": "${summary}${markDownUrl}",
        });
    };
}

