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

import yargs from "yargs";
import fs from "fs";
import yaml from "js-yaml";
import os from "os";

const params = yargs
    .usage("Usage: $0 <command> [options]")

    .command("$0", "Run BGPalerter (default)", function () {
        yargs
            .alias("v", "version")
            .nargs("v", 0)
            .describe("v", "Show version number")

            .alias("c", "config")
            .nargs("c", 1)
            .describe("c", "Config file to load")

            .alias("t", "test")
            .nargs("t", 0)
            .describe("t", "Test the configuration with fake BGP updates")

            .alias("M", "skip-memory-check")
            .nargs("M", 0)
            .describe("M", "Skip memory check")


            .alias("d", "data-volume")
            .nargs("d", 1)
            .describe("d", "A directory where configuration and data is persisted");
    })

    .command("generate", "Generate prefixes to monitor", function () {
        yargs
            .alias("v", "version")
            .nargs("v", 0)
            .describe("v", "Show version number")

            .alias("o", "output")
            .nargs("o", 1)
            .describe("o", "Write to file")

            .alias("a", "asn")
            .nargs("a", 1)
            .describe("a", "AS number to monitor")

            .alias("e", "exclude")
            .nargs("e", 1)
            .describe("e", "Comma-separated list of prefixes to exclude")

            .alias("p", "prefixes")
            .nargs("p", 1)
            .describe("p", "Comma-separated list of prefixes to include")

            .alias("l", "prefixes-file")
            .nargs("l", 1)
            .describe("l", "File containing the prefixes to include in the monitoring. One prefix for each line")

            .alias("i", "ignore-delegated")
            .nargs("i", 0)
            .describe("i", "Ignore delegated prefixes")

            .alias("s", "monitor-as")
            .nargs("s", 1)
            .describe("s", "List of monitored ASes to be added for generic monitoring in options.monitorASns.")

            .alias("m", "monitor-as-origin")
            .nargs("m", 0)
            .describe("m", "Automatically generate list of monitored ASes (options.monitorASns) from prefix origins.")

            .alias("g", "group")
            .nargs("g", 1)
            .describe("x", "Define a user group for all the generated rules.")

            .alias("A", "append")
            .nargs("A", 0)
            .describe("A", "Append the new configuration to the previous one.")

            .alias("D", "debug")
            .nargs("D", 0)
            .describe("D", "Provide verbose output for debugging")

            .alias("H", "historical")
            .nargs("H", 0)
            .describe("H", "Use historical visibility data for generating prefix list (prefixes visible in the last week).")

            .alias("u", "upstreams")
            .nargs("u", 0)
            .describe("u", "Detect a list of allowed upstream ASes and enable detection of new left-side ASes")

            .alias("n", "downstreams")
            .nargs("n", 0)
            .describe("n", "Detect a list of allowed downstream ASes and enable detection of new right-side ASes.")

            .demandOption(["o"]);
    })
    .example("$0 generate -a 2914 -o prefixes.yml", "Generate prefixes for AS2914")
    .help("h")
    .alias("h", "help")
    .epilog("Copyright (c) 2019, NTT Ltd")
    .argv;

switch (params._[0]) {
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
                return Promise.resolve(yaml.load(fs.readFileSync(params.o, "utf8")));
            }
        };

        if (!inputParameters.outputFile) {
            throw new Error("Output file not specified");
        }

        generatePrefixes(inputParameters)
            .then(content => {
                fs.writeFileSync(params.o, yaml.dump(content));
                process.exit(0);
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
