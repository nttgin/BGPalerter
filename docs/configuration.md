# Configuration

The entire configuration is contained in `config.yml`.

The following are common parameters which it is possible to specify in the configuration.

| Parameter | Description  | Expected format | Example  |  Required |
|---|---|---|---|---|
|environment| You can specify various environments. The values "production" (not verbose) and "development" (verbose) will affect the verbosity of the error/debug logs. Other values don't affect the functionalities, they will be used to identify from which environment the log is coming from. | A string | production | Yes |
|notificationIntervalSeconds|Defines the amount of seconds after which an alert can be repeated. An alert is repeated only if the event that triggered it is not yet solved. Please, don't set this value to Infinity, use instead alertOnlyOnce. | An integer | 1800 | Yes |
|alertOnlyOnce| A boolean that, if set to true, will prevent repetitions of the same alert even if the event that triggered it is not yet solved. In this case notificationIntervalSeconds will be ignored. If set to true, the signature of all alerts will be cached in order to recognize if they already happened in the past. This may lead to a memory leak if the amount of alerts is considerable. | A boolean | false | No |
|monitoredPrefixesFiles| The [list](docs/prefixes.md#array) of files containing the prefixes to monitor. See [here](docs/prefixes.md#prefixes) for more informations. | A list of strings (valid .yml files) | -prefixes.yml | Yes |
|logging| A dictionary of parameters containing the configuration for the file logging. | || Yes|
|logging.directory| The directory where the log files will be generated. The directory will be created if not existent. | A string | logs | Yes |
|logging.logRotatePattern| A pattern with date placeholders indicating the name of the file. This pattern will also indicate when a log file is rotated. | A string with date placeholders (YYYY, MM, DD, ss, hh) | YYYY-MM-DD | Yes |
|logging.zippedArchive| Indicates if when a file gets rotates it has to be zipped or not. | A boolean | true | Yes |
|logging.maxSize| Indicates the maximum file size allowed before to be rotated (by adding .number ad the end). This allows to rotate files when logRotatePattern still the same but the file is too big | A string (indicating an amount and a unit of measure) | 20m | Yes |
|logger.maxFiles| Indicates the maximum amount of files or the maximum amount of days the files are retained. When this threshold is passed, files get deleted. | A string (a number or an amount of days ending with "d") | 14d | Yes |
|checkForUpdatesAtBoot| Indicates if at each booth the application should check for updates. If an update is available, a notification will be sent to the default group. If you restart the process often (e.g. debugging, experimenting etc.) set this to false to avoid notifications. Anyway, BGPalerter checks for updates every 10 days.| A boolean | true | Yes |
|uptimeMonitor| A dictionary of parameters containing the configuration for the uptime monitor feature. The API showing the status of BGPalerter is available at The API is reachable at `http://localhost:8011/status`| | | No | 
|uptimeMonitor.active| A boolean that if set to true enables the monitor. When set to false none of the monitoring components and dependencies are loaded (and no port has to be open).| A boolean | true | No | 
|uptimeMonitor.useStatusCodes| A boolean that if set to true enables HTTP status codes in the response. Nothing changes in the JSON output provided by the API. | A boolean | true | No | 
|uptimeMonitor.port| The port on which the API will be reachable.| An integer | 8011 | No | 

To understand how to configure `connectors`, `monitors`, and `reports` go to [composition](composition.md).