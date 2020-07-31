import axios from "axios";
import url from "url";
import brembo from "brembo";
import yaml from "js-yaml";
import batchPromises from "batch-promises";
import RpkiValidator from "rpki-validator";
import fs from "fs";
import { AS } from "./model";
const apiTimeout = 120000;
const clientId = "ntt-bgpalerter"
const rpki = new RpkiValidator({clientId});

module.exports = function generatePrefixes(inputParameters) {
    let {
        asnList,
        outputFile,
        exclude,
        excludeDelegated,
        prefixes,
        monitoredASes,
        httpProxy,
        debug,
        historical,
        group,
        append
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

    if (asnList && asnList.length) {
        asnList = asnList.map(i => i.replace("AS", ""));
        if (asnList.some(i => !new AS([i]).isValid())) {
            throw new Error("One of the AS number is not valid");
        }
    }
    if (monitoredASes && monitoredASes.length) {
        monitoredASes = monitoredASes.map(i => i.replace("AS", ""));
        if (monitoredASes.some(i => !new AS([i]).isValid())) {
            throw new Error("One of the AS number is not valid");
        }
    }

    const getMultipleOrigins = (prefix) => {
        const url = brembo.build("https://stat.ripe.net", {
            path: ["data", "prefix-overview", "data.json"],
            params: {
                client: clientId,
                resource: prefix
            }
        });

        if (debug) {
            console.log("Query", url)
        }

        return axios({
            url,
            method: 'GET',
            responseType: 'json',
            timeout: apiTimeout
        })
            .then(data => {
                let asns = [];
                if (data.data && data.data.data && data.data.data.asns){
                    asns = data.data.data.asns.map(i => i.asn);
                }

                return asns;
            })
            .catch((error) => {
                console.log(error);
                console.log("RIPEstat prefix-overview query failed: cannot retrieve information for " + prefix);
            });
    };

    const getAnnouncedMoreSpecifics = (prefix) => {
        console.log("Generating monitoring rule for", prefix);
        const url = brembo.build("https://stat.ripe.net", {
            path: ["data", "related-prefixes", "data.json"],
            params: {
                client: clientId,
                resource: prefix
            }
        });

        if (debug) {
            console.log("Query", url)
        }

        return axios({
            url,
            method: 'GET',
            responseType: 'json',
            timeout: apiTimeout
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

                if (asns && asns.length) {
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
                client: clientId,
                resource: asn
            }
        });

        console.log(`Getting announced prefixes of AS${asn}`);

        if (debug) {
            console.log("Query", url)
        }

        return axios({
            url,
            method: 'GET',
            responseType: 'json',
            timeout: apiTimeout
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
                    console.log(`WARNING: no announced prefixes were detected for AS${asn}. If you are sure the AS provided is announcing at least one prefix, this could be an issue with the data source (RIPEstat). Try to run the generate command with the option -H.`);
                }
                return list;
            })
            .then(list => list.filter(i => !exclude.includes(i.prefix)))
            .then(list => {

                return batchPromises(40, list, i => {
                    return generateRule(i.prefix, asn, false, null, false);
                })
                    .then(() => list.map(i => i.prefix));
            })

    };

    const validatePrefix = (asn, prefix) => {


        return rpki
            .validate(prefix, asn, false)
            .then(isValid => {
                if (isValid === true) {
                    // All good
                } else if (isValid === false) {
                    delete generateList[prefix];
                    console.log("RPKI invalid:", prefix, asn);
                } else {
                    generateList[prefix].description += ' (No ROA available)';
                    someNotValidatedPrefixes = true;
                }
            })
            .catch((error) => {
                console.log("RPKI validation query failed: cannot retrieve information for " + prefix);
            });
    };

    const getBaseRules = () => {
        if (prefixes) {

            return batchPromises(40, prefixes, p => {
                return generateRule(p, null, false, null, false);
            })
                .then(() => prefixes);
        } else {
            let prefixes = [];
            return batchPromises(1, asnList, asn => {
                return getAnnouncedPrefixes(asn)
                    .then(plist => prefixes = prefixes.concat(plist));
            })
                .then(() => {
                    console.log(`Total prefixes detected: ${prefixes.length}`);
                    return prefixes;
                });
        }
    };

    const getCurrentPrefixes = (outputFile, yamlContent) => {
        const content = fs.readFileSync(outputFile, 'utf8');
        const current = yaml.safeLoad(content) || {};

        function isObject (item) {
            return (item && typeof item === 'object' && !Array.isArray(item));
        }
        function mergeDeep(target, ...sources) {
            if (!sources.length) return target;
            const source = sources.shift();

            if (isObject(target) && isObject(source)) {
                for (const key in source) {
                    if (isObject(source[key])) {
                        if (!target[key]) Object.assign(target, { [key]: {} });
                        mergeDeep(target[key], source[key]);
                    } else {
                        Object.assign(target, { [key]: source[key] });
                    }
                }
            }

            return mergeDeep(target, ...sources);
        }

        return mergeDeep(current, yamlContent);
    };

    return getBaseRules()
        .then(items => [].concat.apply([], items))
        .then(prefixes => {
            return batchPromises(1, prefixes, prefix => {
                return getAnnouncedMoreSpecifics(prefix)
                    .then(items => {
                        return batchPromises(1, items, item => {
                            return generateRule(item.prefix, item.asn, true, item.description, excludeDelegated)
                        });
                    })
                    .catch((e) => {
                        console.log("Cannot download more specific prefixes of", prefix, e);
                    })
            })
                .catch((e) => {
                    console.log("Cannot download more specific prefixes", e);
                })
        })
        .then(() => rpki.preCache())
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

            if (append) {
                const finalList = getCurrentPrefixes(outputFile, generateList);
                fs.writeFileSync(outputFile, yaml.dump(finalList));
            } else {
                fs.writeFileSync(outputFile, yaml.dump(generateList));
            }

            if (someNotValidatedPrefixes) {
                console.log("WARNING: the generated configuration is a snapshot of what is currently announced. Some of the prefixes don't have ROA objects associated or are RPKI invalid. Please, verify the config file by hand!");
            }
            console.log("Done!");
        })
        .catch((e) => {
            console.log("Something went wrong", e);
        })

};
