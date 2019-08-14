# BGPalerter


## TL;DR

1. Download the executable from `bin/` (be careful to select the one for your OS)

2. Download `config.yml` and `prefixes.yml` and place them in the same directory of the executable

3. Modify `prefixes.yml` and add the prefixes you want to monitor

4. Run the executable

5. See the alerts in `logs/reports-YYYY-MM-DD.log`

In `config.yml` you can find other reporting mechanisms (e.g. email and slack) in addition to logging on files. 
Please uncomment the relative section and configure accordingly to your needs.

## More information for users

### Composition

You can compose the tool with 3 main components: connectors, monitors, and reports.

Connectors retrieve/listen the data from different sources and transform them in a common format.
Monitors analize the data flow and produce alerts. Different monitors try to detect different issues.
Reports send/store the alerts, e.g. by email or to a file.

##### connectors

Possible connectors are:

* _connectorRIS_, for real-time data from RIPE RIS (https://ris-live.ripe.net/)

* _connectorTest_, for testing purposes, it provokes all types of alerting

##### monitors

Possible monitors are:

* _monitorHijack_, for monitoring hijacks

* _monitorVisibility_, for monitoring prefixes visibility (you will get notified when withdrawals make monitored routes disappear). A threshold can be specified in config.yml to trigger an alert only if the issue is visible from a certain amount of peers.

* _monitorNewPrefix_, for monitoring if new more specifics (of the monitored prefixes) start to be announced

##### reports

Possible reports are:

* _reportEmail_, to send alerts by email. Smtp configurations are in config.yml

* _reportFile_, to log the alerts in files. File directory, format, and log rotation configurations are in config.yml

* _reportSlack_, to send alerts in Slack. Hook url is configurable in config.yml


## More information for developers

To start develop:

1. git clone this repo

2. install Node.js (version >= 10.16) and npm ([installing node and npm](https://nodejs.org/en/download/))

3. execute `npm install` or `yarn` to install all dependencies ([installing yarn](https://yarnpkg.com/lang/en/docs/install))

4. run `npm run watch-and-serve` to run the application. At every file change it will self-reload.

### All npm commands

* `npm run watch-and-serve` to run the application from source code and monitor for file changes

* `npm run serve` to run the application from the source

* `npm run test` to run the tests

* `npm run build` to compile and build OS native applications

### Composition

You can compose the tool with 3 main components: connectors, monitors, and reports.
All connectors must extend the class Connector. Monitors extend the class Monitor. Reports extend the class Report.
From the super class they will inherit various generic methods while some specific for the particular component have to be implemented.
Reports don't receive only alerts but also the data that provoked such alerts (so you can store the data and replay the accident later).

In `config.yml`, for each collection of components:

* `file` - refers to the file name which contains the class

* `channels` - refer to what channel(s) will be used to send or receive messages

* `params` - whatever parameters it may be needed to the component at creation time




