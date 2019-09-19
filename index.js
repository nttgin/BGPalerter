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

import yargs from 'yargs';

const params = yargs
    .usage('Usage: $0 <command> [options]')

    .command('$0', 'Run BGPalerter (default)', function () {
    })
    .example('$0 run -c config.yml', 'Run BGPalerter')


    .command('generate', 'Generate prefixes to monitor', function () {
        yargs.alias('o', 'output')
            .nargs('o', 1)
            .describe('o', 'Write to file')

            .alias('a', 'asn')
            .nargs('a', 1)
            .describe('a', 'AS number to monitor')

            .alias('e', 'exclude')
            .nargs('e', 1)
            .describe('e', 'Prefixes to exclude')

            .alias('i', 'ignore-delegated')
            .nargs('i', 0)
            .describe('i', 'Ignore delegated prefixes')

            .demandOption(['o', 'a'])
    })
    .example('$0 generate -a 2914 -o prefixes.yml', 'Generate prefixes for AS2914')


    .help('h')
    .alias('h', 'help')
    .epilog('Copyright (c) 2019, NTT Ltd')
    .argv;

switch(params._[0]) {
    case "generate":
        const generatePrefixes = require("./generatePrefixesList");
        generatePrefixes(
            params.a.toString(),
            params.o,
            (params.e || "").split(","),
            params.i || false
        );
        break;

    default: // Run monitor
        const Worker = require("./worker").default;
        module.exports = new Worker(params.c).pubSub;
}
