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
                return yaml.load(fs.readFileSync(this.configFile, 'utf8')) || this.default;
            } catch (error) {
                throw new Error("The file " + this.configFile + " is not valid yml: " + error.message.split(":")[0]);
            }
        } else {
            console.log("Impossible to load config.yml. A default configuration file has been generated.");

            this.downloadDefault()
                .then(data => {
                    fs.writeFileSync(this.configFile, data);
                    yaml.load(fs.readFileSync(this.configFile, 'utf8')); // Test readability and format
                })
                .catch(() => {
                    fs.writeFileSync(this.configFile, ymlBasicConfig); // Download failed, write simple default config
                });

            return this.default;
        }

    };

}
