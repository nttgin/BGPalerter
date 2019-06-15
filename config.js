import MonitorHijack from "./monitors/monitorHijack";
import yaml from "js-yaml";
import fs from "fs";

const configFile = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));

const config = {
    monitors: [
        MonitorHijack
    ]
};

module.exports = Object.assign(config, configFile);