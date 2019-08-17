import axios from "axios";
import brembo from "brembo";
import yaml from "js-yaml";
import fs from "fs";


const asns = process.argv[2];
const outputFile = process.argv[3];
const generateList = {};
let someNotValidatedPrefixes = false;

if (!asns) {
    throw new Error("One or more comma-separated AS numbers have to be specified");
}

if (!outputFile) {
    throw new Error("Output file not specified");
}

const asnList = asns.split(",");


const getAnnouncedPrefixes = (asn) => {
    const url = brembo.build("https://stat.ripe.net", {
        path: ["data", "announced-prefixes", "data.json"],
        params: {
            resource: asn
        }
    });

    return axios({
        url,
        method: 'GET',
        responseType: 'json'
    })
        .then(data => {
            if (data.data && data.data.data && data.data.data.prefixes) {
                return data.data.data.prefixes
                    .filter(item => {
                        const latest = item.timelines
                            .map(t => (t.endtime) ? new Date(t.endtime) : new Date())
                            .sort((a,b) => a-b)
                            .pop();

                        return latest.getTime() + (3600 * 24 * 1000) > new Date().getTime();
                    })

            }
            return [];
        })
        .then(list => list
            .map(i => {

                generateList[i.prefix] = {
                    description: "No description provided",
                    asn: parseInt(asn),
                    ignoreMorespecifics: false
                };

                return i.prefix;
            }))
        .then(prefixes => {
            return Promise.all(prefixes.map(prefix => validatePrefix(asn, prefix)));
        })
};

const validatePrefix = (asn, prefix) => {
    const url = brembo.build("https://stat.ripe.net", {
        path: ["data", "rpki-validation", "data.json"],
        params: {
            resource: asn,
            prefix
        }
    });

    return axios({
        url,
        method: 'GET',
        responseType: 'json'
    })
        .then(data => {
            if (data.data && data.data.data && data.data.data.validating_roas) {
                return data.data.data.validating_roas.map(i => i.validity).some(i => i === 'valid');
            }
            return false;
        })
        .then((isValid) => {
            if (isValid) {
                generateList[prefix].description += ' (valid ROA available)';
            } else {
                someNotValidatedPrefixes = true;
            }
        })
};

Promise
    .all(asnList.map(getAnnouncedPrefixes))
    .then((data) => {
        const yamlContent = yaml.dump(generateList);
        fs.writeFileSync(outputFile, yamlContent);

        if (someNotValidatedPrefixes) {
            console.log("WARNING: some prefixes don't have a valid ROA associated (see output for more details).");
        }
        console.log("Done!");
    });
