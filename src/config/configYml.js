import Config from "./config";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";

export default class ConfigYml extends Config {
    constructor(params) {
        super(params);
        this.configFile = global.EXTERNAL_CONFIG_FILE ||
            ((global.EXTERNAL_VOLUME_DIRECTORY)
                ? global.EXTERNAL_VOLUME_DIRECTORY + 'config.yml'
                : path.resolve(process.cwd(), 'config.yml'));

        this.groupsFile = global.EXTERNAL_GROUP_FILE;

        console.log("Loaded config:", this.configFile);
    };

    save = (config) => {
        try {
            fs.writeFileSync(this.configFile,  yaml.dump(config));
            yaml.load(fs.readFileSync(this.configFile, 'utf8')); // Test readability and format
        } catch (error) {
            throw new Error("Cannot save the configuration in " + this.configFile);
        }
    };

    retrieve = () => {
        const ymlBasicConfig = yaml.dump(this.default);

        if (fs.existsSync(this.configFile)) {
            try {
                const config = yaml.load(fs.readFileSync(this.configFile, 'utf8')) || this.default;
                this._readUserGroupsFiles(config);

                return config;
            } catch (error) {
                throw new Error("The file " + this.configFile + " is not valid yml: " + error.message.split(":")[0]);
            }
        } else {
            console.log("Impossible to load config.yml. A default configuration file has been generated.");

            this.downloadDefault()
                .then(data => {
                    fs.writeFileSync(this.configFile, data);
                    yaml.load(fs.readFileSync(this.configFile, 'utf8')); // Test readability and format

                    this._readUserGroupsFiles(data);
                })
                .catch(() => {
                    fs.writeFileSync(this.configFile, ymlBasicConfig); // Download failed, write simple default config
                });

            return this.default;
        }
    };

    _readUserGroupsFiles = (config) => {
        if (config.groupsFile) {
            this.groupsFile = ((global.EXTERNAL_VOLUME_DIRECTORY)
                ? global.EXTERNAL_VOLUME_DIRECTORY + config.groupsFile
                : path.resolve(process.cwd(), config.groupsFile));

            const userGroups = yaml.load(fs.readFileSync(this.groupsFile, 'utf8'));

            for (let report of config.reports) {
                const name = report.file;
                const groups = userGroups[name];
                if (userGroups[name]) {
                    report.userGroups = groups;
                }
            }

            fs.watchFile(this.groupsFile, () => {
                if (this._watchPrefixFileTimer) {
                    clearTimeout(this._watchPrefixFileTimer)
                }
                this._watchPrefixFileTimer = setTimeout(() => {
                    const userGroups = yaml.load(fs.readFileSync(this.groupsFile, 'utf8'));
                    for (let report of config.reports) {
                        const name = report.file;
                        const groups = userGroups[name];
                        if (userGroups[name]) {
                            report.userGroups = groups;
                        }
                    }
                }, 5000);
            });
        }

    };

}
