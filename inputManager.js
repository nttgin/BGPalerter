import yaml from "js-yaml";
import fs from "fs";
import ip from "ip";


export default class InputManager {

    constructor(config){
        this.prefixes = [];

        if (!config.monitoredPrefixesFiles || config.monitoredPrefixesFiles.length === 0){
            throw new Error("The monitoredPrefixesFiles key is missing in the confiug file");
        }

        for (let prefixesFile of config.monitoredPrefixesFiles){
            const monitoredPrefixesFile = yaml.safeLoad(fs.readFileSync('./' + prefixesFile, 'utf8'));

            const monitoredPrefixes = Object.keys(monitoredPrefixesFile)
                .map(i => Object.assign(monitoredPrefixesFile[i], { prefix: i }));

            this.prefixes = this.prefixes.concat(monitoredPrefixes);
        }

    };


    getMonitoredMoreSpecifics = () => {
        return this.prefixes.filter(p => !p.ignoreMorespecifics);
    };

    getMonitoredMoreSpecificsBest = () => {
        const prefixes = this.getMonitoredMoreSpecifics();
        const length = prefixes.length;
        let contained = false;
        const out = [];

        for (let n=0; n<length; n++) {
            for (let h=0; h<length; h++) {
                if (!contained) {
                    contained = ip.cidrSubnet(prefixes[h]).contains(prefixes[n]);
                }
            }
            if (contained) {
                out.push(prefixes);
            }
        }
    };

    getMonitoredPrefixes = () => {
        return this.prefixes;
    };

}