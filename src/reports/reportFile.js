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

export default class ReportFile extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);

        this.persistAlerts = params.persistAlertData;
        this.alertsDirectory = env.config.volume + params.alertDataDirectory;
        if (this.persistAlerts && !this.alertsDirectory) {
            this.persistAlerts = false;
            this.logger.log({
                level: "error",
                message: "Cannot persist alert data, the parameter alertDataDirectory is missing."
            });
        }
        this.latestTimestamps = [];
        this.timestampsBacklogSize = 100;
    }

    writeDataOnFile = (message) => {
        try {
            const timestamp = `${message.earliest}-${message.latest}`;
            this.latestTimestamps.push(timestamp);
            const count = this.latestTimestamps.filter(i => i === timestamp).length;
            this.latestTimestamps = this.latestTimestamps.slice(-this.timestampsBacklogSize);
            const filename = `${this.alertsDirectory}/alert-${timestamp}-${count}.json`;

            if (!fs.existsSync(this.alertsDirectory)) {
                fs.mkdirSync(this.alertsDirectory, {recursive: true});
            }

            fs.writeFileSync(filename, JSON.stringify(message));
        } catch (error) {
            this.logger.log({
                level: "error",
                message: error
            });
        }
    };

    report = (message, content) => {
        this.logger.log({
            level: "verbose",
            message: content.message
        });

        if (this.persistAlerts) {
            this.writeDataOnFile(content);
        }
    };
}