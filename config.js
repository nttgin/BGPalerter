import MonitorHijack from "./monitors/monitorHijack";
import ReportEmail from "./reports/reportEmail";
import yaml from "js-yaml";
import fs from "fs";

const configFile = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));

const config = {
    monitors: [
        {
            class: MonitorHijack,
            channel: "hijack",
            name: "basic-hijack-detection"
        }
    ],

    reports: [
        {
            class: ReportEmail,
            channels: ["hijack"]
        }
    ]
};

module.exports = Object.assign(config, configFile);