#BGPalerter


##TL;DR

1. Download the executable from bin/ (be careful to select the one for your OS)
2. Download config.yml and prefixes.yml and place them in the same directory of the executable
3. Modify prefixes.yml and add the prefixes you want to monitor
4. (optional) Modify config.yml and add your smtp configuration for email alerting
5. Run the executable
6. See the alerts in logs/reports-YYYY-MM-DD.log (or in the mailbox)

##For Users

###Composition
You can compose the tool with 3 main components: connectors, monitors, and reports.

Connectors retrieve/listen the data from different sources and transform them in a common format.
Monitors analize the data flow and produce alerts. Different monitors try to detect different issues.
Reports send/store the alerts, e.g. by email or to a file.

####connectors
Possible connectors are:
- connectorRIS, for real-time data from RIPE RIS (https://ris-live.ripe.net/)
- connectorTest, for testing purposes, it provokes all types of alerting

####monitors
Possible monitors are:
- monitorHijack, for monitoring hijacks
- monitorVisibility, for monitoring prefixes visibility (you will get notified when withdrawals make monitored routes disappear). A threshold can be specified in config.yml to trigger an alert only if the issue is visible from a certain amount of peers.
- monitorNewPrefix, for monitoring if new more specifics (of the monitored prefixes) start to be announced

####reports
Possible reports are:
- reportEmail, to send alerts by email. Smtp configurations are in config.yml
- reportFile, to log the alerts in files. File directory, format, and log rotation configurations are in config.yml

##For Developers
To start develop:
1. git clone this repo
2. execute "yarn" to install all dependencies
3. run "npm watch-and-serve" to run the application. At every file change it will self-reload.

###npm commands
- "npm watch-and serve" to run the application from source code and monitor for file changes
- "npm serve" to run the application from the source
- "npm test" to run the tests
- "npm build" to compile and buil native applications

###Composition
You can compose the tool with 3 main components: connectors, monitors, and reports.
All connectors must extend the class Connector. Monitors extend the class Monitor. Reports extend the class Report.
From the super class they will inherit various generic methods wile some specific for the particular component have to be implemented.

In config.yml, for each collection of components:
- file - refers to the file name which contains the class
- channel(s) - refer to what channel will be used to send/receive messages
- params - whatever param it may be needed to the component at creation time




