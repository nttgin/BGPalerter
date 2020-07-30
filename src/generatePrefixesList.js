import axios from "axios";
import url from "url";
import brembo from "brembo";
import yaml from "js-yaml";
import fs from "fs";
const batchPromises = require('batch-promises');

module.exports = function generatePrefixes(inputParameters) {
    const {
        asnList,
        outputFile,
        exclude,
        excludeDelegated,
        prefixes,
        monitoredASes,
        httpProxy,
        debug,
        historical,
        group
    } = inputParameters;

    const generateList = {};
    const allOrigins = {};
    let someNotValidatedPrefixes = false;

    if (httpProxy) {
        const HttpsProxyAgent = require("https-proxy-agent");
        axios.defaults.httpsAgent = new HttpsProxyAgent(url.parse(httpProxy));
    }

    if (historical) {
        console.log("WARNING: you are using historical visibility data for generating the prefix list.");
    }
    
    if (!asnList && !prefixes) {
        throw new Error("You need to specify at least an AS number or a list of prefixes.");
    }

    if (asnList && prefixes) {
        throw new Error("You can specify an AS number or a list of prefixes, not both.");
    }

    if (!outputFile) {
        throw new Error("Output file not specified");
    }

    const getMultipleOrigins = (prefix) => {
        const url = brembo.build("https://stat.ripe.net", {
            path: ["data", "prefix-overview", "data.json"],
            params: {
                resource: prefix
            }
        });

        if (debug) {
            console.log("Query", url)
        }

        return axios({
            url,
            method: 'GET',
            responseType: 'json'
        })
            .then(data => {
                let asns = [];
                if (data.data && data.data.data && data.data.data.asns){
                    asns = data.data.data.asns.map(i => i.asn);
                }

                return asns;
            })
            .catch(() => {
                console.log("RIPEstat prefix-overview query failed: cannot retrieve information for " + prefix);
            });
    };

    const getAnnouncedMoreSpecifics = (prefix) => {
        console.log("Generating monitoring rule for", prefix);
        const url = brembo.build("https://stat.ripe.net", {
            path: ["data", "related-prefixes", "data.json"],
            params: {
                resource: prefix
            }
        });

        if (debug) {
            console.log("Query", url)
        }

        return axios({
            url,
            method: 'GET',
            responseType: 'json'
        })
            .then(data => {
                let prefixes = [];
                if (data.data && data.data.data && data.data.data.prefixes){
                    prefixes = data.data.data.prefixes
                        .filter(i => i.relationship === "Overlap - More Specific")
                        .map(i => {
                            console.log("Detected more specific " + i.prefix);
                            return {
                                asn: i.origin_asn,
                                description: i.asn_name,
                                prefix: i.prefix
                            }
                        });
                }

                return prefixes;
            })
            .catch(() => {
                console.log("RIPEstat related-prefixes query failed: cannot retrieve information for " + prefix);
            });

    };

    const generateRule = (prefix, asn, ignoreMorespecifics, description, excludeDelegated) =>
        getMultipleOrigins(prefix)
            .then(asns => {

                if (asns.length) {
                    const origin = (asns && asns.length) ? asns : [asn];

                    for (let o of origin) {
                        allOrigins[o] = true;
                    }

                    generateList[prefix] = {
                        description: description || "No description provided",
                        asn: origin.map(i => parseInt(i)),
                        ignoreMorespecifics: ignoreMorespecifics,
                        ignore: excludeDelegated,
                        group: group || "default"
                    };
                }
            });

    const getAnnouncedPrefixes = (asn) => {
        const url = brembo.build("https://stat.ripe.net", {
            path: ["data", "announced-prefixes", "data.json"],
            params: {
                resource: asn
            }
        });

        if (debug) {
            console.log("Query", url)
        }

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

                            if (historical) {
                                return latest.getTime() + (3600 * 24 * 1000 * 7) > new Date().getTime();
                            } else {
                                return latest.getTime() + (3600 * 24 * 1000) > new Date().getTime();
                            }
                        })

                }
                return [];
            })
            .then(list => {
                if (list.length === 0) {
                    console.log("WARNING: no announced prefixes were detected. If you are sure the AS provided is announcing at least one prefix, this could be an issue with the data source (RIPEstat). Try to run the generate command with the option -H.");
                }
                return list;
            })
            .then(list => list.filter(i => !exclude.includes(i.prefix)))
            .then(list => {
                return Promise.all(list.map(i => generateRule(i.prefix, asn, false, null, false)))
                    .then(() => list.map(i => i.prefix))
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

        if (debug) {
            console.log("Query", url)
        }

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
            .catch(() => {
                console.log("RIPEstat rpki-validation query failed: cannot retrieve information for " + prefix);
            });
    };

    const getBaseRules = () => {
        if (prefixes) {
            return Promise
                .all(prefixes.map(p => generateRule(p, null, false, null, false)))
                .then(() => prefixes);
        } else {
            return Promise.all(asnList.map(getAnnouncedPrefixes));
        }
    };

    return getBaseRules()
        .then(items => [].concat.apply([], items))
        .then(prefixes => {
            return batchPromises(10, prefixes, prefix => {
                return getAnnouncedMoreSpecifics(prefix)
                    .then((items) => Promise
                        .all(items.map(item => generateRule(item.prefix, item.asn, true, item.description, excludeDelegated))))
                    .catch((e) => {
                        console.log("Cannot download more specific prefixes of", prefix, e);
                    })
            })
                .catch((e) => {
                    console.log("Cannot download more specific prefixes", e);
                })
        })
        .then(() => { // Check
            return Promise.all(Object.keys(generateList).map(prefix => validatePrefix(generateList[prefix].asn[0], prefix)))
                .catch((e) => {
                    console.log("ROA check failed due to error", e);
                })
        })
        .then(() => { // Add the options for monitorASns

            const generateMonitoredAsObject = function (list) {
                generateList.options = generateList.options || {};
                generateList.options.monitorASns = generateList.options.monitorASns || {};
                for (let monitoredAs of list) {
                    console.log("Generating generic monitoring rule for AS", monitoredAs);
                    generateList.options.monitorASns[monitoredAs] = {
                        group: group || "default"
                    };
                }
            };
            if (monitoredASes === true) {
                generateMonitoredAsObject(asnList);
            } else if (monitoredASes.length) {
                generateMonitoredAsObject(monitoredASes);
            }
            // Otherwise nothing
        })
        .then(() => { // write everything into the file
            const yamlContent = yaml.dump(generateList);
            fs.writeFileSync(outputFile, yamlContent);

            if (someNotValidatedPrefixes) {
                console.log("WARNING: the generated configuration is a snapshot of what is currently announced. Some of the prefixes don't have ROA objects associated or are RPKI invalid. Please, verify the config file by hand!");
            }
            console.log("Done!");
        })
        .catch((e) => {
            console.log("Something went wrong", e);
        })

};
