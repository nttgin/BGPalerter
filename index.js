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

import {parseArgs} from "util";
import fs from "fs";
import yaml from "js-yaml";
import {loadYaml} from "./src/utils/yaml";
import os from "os";
import {version} from "./package.json";

const commonOptions = [
    {short: "h", long: "help", type: "boolean", description: "Show help"},
    {short: "v", long: "version", type: "boolean", description: "Show version number"}
];

// Options without a description are accepted but not shown in the help
const commands = {
    run: {
        usage: "bgpalerter [options]",
        description: "Run BGPalerter (default)",
        options: [
            ...commonOptions,
            {short: "c", long: "config", type: "string", description: "Config file to load"},
            {short: "t", long: "test", type: "boolean", description: "Test the configuration with fake BGP updates"},
            {short: "M", long: "skip-memory-check", type: "boolean", description: "Skip memory check"},
            {short: "d", long: "data-volume", type: "string", description: "A directory where configuration and data is persisted"},
            {short: "E", type: "string"}
        ]
    },
    generate: {
        usage: "bgpalerter generate [options]",
        description: "Generate prefixes to monitor",
        required: ["o"],
        options: [
            ...commonOptions,
            {short: "o", long: "output", type: "string", description: "Write to file"},
            {short: "a", long: "asn", type: "string", description: "AS number to monitor"},
            {short: "e", long: "exclude", type: "string", description: "Comma-separated list of prefixes to exclude"},
            {short: "p", long: "prefixes", type: "string", description: "Comma-separated list of prefixes to include"},
            {short: "l", long: "prefixes-file", type: "string", description: "File containing the prefixes to include in the monitoring. One prefix for each line"},
            {short: "i", long: "ignore-delegated", type: "boolean", description: "Ignore delegated prefixes"},
            {short: "s", long: "monitor-as", type: "string", description: "List of monitored ASes to be added for generic monitoring in options.monitorASns."},
            {short: "m", long: "monitor-as-origin", type: "boolean", description: "Automatically generate list of monitored ASes (options.monitorASns) from prefix origins."},
            {short: "g", long: "group", type: "string", description: "Define a user group for all the generated rules."},
            {short: "A", long: "append", type: "boolean", description: "Append the new configuration to the previous one."},
            {short: "D", long: "debug", type: "boolean", description: "Provide verbose output for debugging"},
            {short: "H", long: "historical", type: "boolean", description: "Use historical visibility data for generating prefix list (prefixes visible in the last week)."},
            {short: "u", long: "upstreams", type: "boolean", description: "Detect a list of allowed upstream ASes and enable detection of new left-side ASes"},
            {short: "n", long: "downstreams", type: "boolean", description: "Detect a list of allowed downstream ASes and enable detection of new right-side ASes."},
            {long: "pf", type: "string"}
        ]
    }
};

const getHelp = (command) => {
    const {usage, description, options} = commands[command];
    const visible = options.filter(i => i.description);
    const flags = visible.map(i => [i.short && `-${i.short}`, i.long && `--${i.long}`].filter(Boolean).join(", "));
    const width = Math.max(...flags.map(i => i.length)) + 2;

    return [
        `Usage: ${usage}`,
        "",
        description,
        "",
        "Commands:",
        "  bgpalerter           Run BGPalerter (default)",
        "  bgpalerter generate  Generate prefixes to monitor",
        "",
        "Options:",
        ...visible.map((option, n) => `  ${flags[n].padEnd(width)}${option.description}`),
        "",
        "Examples:",
        "  bgpalerter generate -a 2914 -o prefixes.yml  Generate prefixes for AS2914",
        "",
        "Copyright (c) 2019, NTT Ltd"
    ].join("\n");
};

const parseCli = (argv) => {
    const command = argv[0] === "generate" ? "generate" : "run";
    const spec = commands[command];
    const options = {};

    for (const {short, long, type} of spec.options) {
        if (long) {
            options[long] = short ? {type, short} : {type};
        }
        // Also accept the single letter as long option (e.g., --d), as documented
        if (short) {
            options[short] = long ? {type} : {type, short};
        }
    }

    const {values} = parseArgs({
        args: command === "generate" ? argv.slice(1) : argv,
        options,
        strict: false,
        allowPositionals: true
    });

    const params = {};
    for (const {short, long, type} of spec.options) {
        const key = short || long;
        const value = (long && values[long] !== undefined) ? values[long] : values[short];

        if (type === "string" && value === true) {
            console.error(`${getHelp(command)}\n\nNot enough arguments following: ${key}`);
            process.exit(1);
        }
        params[key] = value;
    }

    if (params.h) {
        console.log(getHelp(command));
        process.exit(0);
    }

    if (params.v) {
        console.log(version);
        process.exit(0);
    }

    const missing = (spec.required || []).filter(i => params[i] === undefined);
    if (missing.length) {
        console.error(`${getHelp(command)}\n\nMissing required argument: ${missing.join(", ")}`);
        process.exit(1);
    }

    return {command, params};
};

const {command, params} = parseCli(process.argv.slice(2));

switch (command) {
    case "generate":
        const generatePrefixes = require("./src/generatePrefixesList");
        const debug = !!params.D;
        const historical = !!params.H;
        let prefixes = null;
        let monitoredASes = false;
        if (params.pf) {
            throw new Error("The argument --pf has been deprecated. Use -l instead");
        }
        if (params.p && params.l) {
            throw new Error("The argument -p is not compatible with the argument -l");
        } else if (params.p) {
            prefixes = params.p.split(",");
        } else if (params.l) {
            const fs = require("fs");
            if (fs.existsSync(params.l)) {
                prefixes = fs.readFileSync(params.l, "utf8").split(/\r?\n/).filter(i => i && true);
            } else {
                throw new Error("The prefix list file (-l) is not readable");
            }
        }

        if (params.s && params.m) {
            throw new Error("You can specify -s or -m, not both");
        } else if (params.s) {
            monitoredASes = (params.s) ? params.s.toString().split(",") : null;
        } else if (params.m) {
            monitoredASes = true;
        }

        const inputParameters = {
            asnList: (params.a) ? params.a.toString().split(",") : null,
            outputFile: params.o,
            exclude: (params.e) ? params.e.toString().split(",") : null,
            excludeDelegated: params.i || false,
            prefixes,
            monitoredASes,
            debug,
            historical,
            group: params.g || null,
            append: !!params.A,
            logger: null,
            upstreams: !!params.u,
            downstreams: !!params.n,
            getCurrentPrefixesList: () => {
                return Promise.resolve(loadYaml(fs.readFileSync(params.o, "utf8")) || {});
            }
        };

        if (!inputParameters.outputFile) {
            throw new Error("Output file not specified");
        }

        generatePrefixes(inputParameters)
            .then(content => {
                fs.writeFileSync(params.o, yaml.dump(content));
                process.exit(0);
            })
            .catch((e) => {
                console.log(`Something went wrong ${e}`);
                process.exit(1);
            });

        break;

    default: // Run monitor

        if (!params.M && os.totalmem() < 4294967296) {
            throw new Error("You need 4GB of RAM to run BGPalerter");
        }

        global.DRY_RUN = !!params.t;
        if (global.DRY_RUN) {
            console.log("Testing BGPalerter configuration. WARNING: remove -t option for production monitoring.");
        }
        const Worker = require("./src/worker").default;
        module.exports = new Worker({
            configFile: params.c,
            volume: params.d,
            groupFile: params.E
        });
}
