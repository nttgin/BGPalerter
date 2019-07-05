import yaml from "js-yaml";
import fs from "fs";
import Input from "./input";

export default class InputYml extends Input {

    constructor(config){
        super(config);
        this.prefixes = [];

        if (!config.monitoredPrefixesFiles || config.monitoredPrefixesFiles.length === 0){
            throw new Error("The monitoredPrefixesFiles key is missing in the config file");
        }

        for (let prefixesFile of config.monitoredPrefixesFiles){
            const monitoredPrefixesFile = yaml.safeLoad(fs.readFileSync('./' + prefixesFile, 'utf8'));

            const monitoredPrefixes = Object.keys(monitoredPrefixesFile)
                .map(i => {
                    return Object.assign({
                        prefix: i,
                        user: 'default'
                    }, monitoredPrefixesFile[i])
                });

            this.prefixes = this.prefixes.concat(monitoredPrefixes);
        }

    };

    getMonitoredMoreSpecifics = () => {
        return this.prefixes.filter(p => !p.ignoreMorespecifics);
    };

    getMonitoredPrefixes = () => {
        return this.prefixes;
    };

}