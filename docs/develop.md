# More information for developers

To start development see how to install the source [here](installation.md#running-bgpalerter-from-the-source-code).


## All npm commands

* `npm run watch-and-serve` to run the application from source code and monitor for file changes

* `npm run serve` to run the application from the source

* `npm run test` to run the tests

* `npm run build` to compile and build OS native applications

* `npm run generate-prefixes -- --a ASN(S) --o OUTPUT_FILE` to generate the monitored prefixes file

## Composition notes

You can compose the tool with 3 main components: connectors, monitors, and reports.

> **Important:**
All connectors MUST extend the class Connector. Monitors extend the class Monitor. Reports extend the class Report.
From the superclass they will inherit various generic methods while some have to be implemented.

Reports don't receive only alerts but also the data that provoked such alerts (so you can store the data and replay the accident later).
