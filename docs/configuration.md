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
|uptimeMonitors| A list of modules allowing various way to check for the status of BGPalerter (e.g. API, heartbeat). See [here](uptime-monitor.md) for more information. | | | No | 



## Composition

You can compose the tool with 3 main components: connectors, monitors, and reports.

* Connectors retrieve/listen to the data from different sources and transform them to a common format.
* Monitors analyze the data flow and produce alerts. Different monitors try to detect different issues.
* Reports send/store the alerts, e.g. by email or to a file.

> In config.yml.example there are all the possible components declarations (similar to the one of the example below). You can enable the various components by uncommenting the related block.


Example of composition:

```yaml
connectors:
  - file: connectorRIS
    name: ris
    
monitors:
  - file: monitorHijack
    channel: hijack
    name: basic-hijack-detection

  - file: monitorPath
    channel: path
    name: path-matching
    params:
      thresholdMinPeers: 10

reports:
  - file: reportFile
    channels:
      - hijack
      - path
```

Each monitor declaration is composed of:

| Attribute | Description |
|---|---|
| file | Name of the file containing the monitor implementation. Monitor implementations are in the `moniors` directory. |
| channel | The name of the channel that will be used by the monitor to dispatch messages. If the inserted name doesn't correspond to an already existent channel, a new channel is created.|
|name| The name associated to the monitor. Multiple monitors with the same implementation can be loaded with different names. This name will be used to annotate messages in order track from where they are coming from.|
|params| A dictionary of parameters that can be useful for the functioning of the monitor. Different monitors with the same implementation can be initialized with different parameters. |

Each report declaration is composed of:

| Attribute | Description |
|---|---|
| file | Name of the file containing the report implementation. Report implementations are in the `reports` directory. |
|params| A dictionary of parameters that can be useful for the functioning of the report. It is common to have group declarations among the parameters. Different reports with the same implementation can be initialized with different parameters. |
|channels| A [list](docs/prefixes.md#array) of channels the monitor will listen (never write). Different reports with the same implementation can be initialized with a different list of channels to listen.|


Each connector is composed of:

| Attribute | Description |
|---|---|
|file|Name of the file containing the connector implementation. Report implementations are in the `connectors` directory. |
|params| A dictionary of parameters that can be useful for the functioning of the connector.  E.g. the data source url, password, socket options|
|name| The name that will be used to identify this connector and to annotate logs and messages. | 

> Connectors will always send the BGP updates to all the channels. The BGP updates have all the same format.



### Connectors

#### connectorRIS
It connects to RIPE RIS https://ris-live.ripe.net/ and receives BGP updates coming from 600+ peers.

Parameters for this connector module:

|Parameter| Description| 
|---|---|
|url| WebSocket end-point of RIS, which currently is `wss://ris-live.ripe.net/v1/ws/` |
|subscription| Dictionary containing the parameters required by RIS. Refer to the [official documentation](https://ris-live.ripe.net/) for details.|

#### connectorTest

Connector used for testing purposes, it provokes all types of alerting. Needed to run the tests (`npm run test`) .


### Monitors

#### monitorHijack

This monitor has the logic to detect basic hijack.
In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* The origin AS of the prefix is different from the ones specified in the configuration.
* A more specific of the prefix has been announced by an AS which is different from the ones specified.
* The BGP update declares an AS_SET as origin and at least one of the AS in the AS_SET is not specified in the configuration.

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |


#### monitorVisibility

This monitor has the logic to detect loss of visibility.
In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* The prefix is not visible anymore from at least `thresholdMinPeers` peers.

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |


#### monitorPath

This monitor detects BGP updates containing AS_PATH which match particular regular expressions.

> Example: 
> The prefixes list of BGPalerter has an entry such as:
> ```yaml
> 165.254.255.0/24:
>    asn: 15562
>    description: an example on path matching
>    ignoreMorespecifics: false
>  path:
>    match: ".*2194,1234$"
>    notMatch: ".*5054.*"
>    matchDescription: detected scrubbing center
> ```
> An alert will be generated when a BGP announcements for 165.254.255.0/24 or a more specific contains an AS_PATH 
> terminating in 2194,1234 but not containing 5054. The generated alert will report the matchDescription field.

More path matching options are available, see the entire list [here](prefixes.md#prefixes-fields)

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |




#### monitorNewPrefix

This monitor has the logic to detect unexpected change of configuration in the form of new more specific prefixes announced by the correct AS.

In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* A sub-prefix of the monitored prefix starts to be announced by the same AS declared for the prefix.

> Example: 
> The prefixes list of BGPalerter has an entry such as:
> ```yaml
> 50.82.0.0/20:
>    asn: 58302
>    description: an example
>    ignoreMorespecifics: false
> ```
> If in config.yml monitorNewPrefix is enabled you will receive alerts every time a more specific prefix (e.g. 50.82.4.0/24) is announced by AS58302.

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |


#### monitorAS

This monitor will listen for all announcements produced by the monitored Autonomous Systems and will detect when a prefix, which is not in the monitored prefixes list, is announced.
This is useful if you want to be alerted in case your AS starts announcing something you didn't intend to announce (e.g. misconfiguration, typo).


> Example: 
> The prefixes list of BGPalerter has an options.monitorASns list declared, such as:
> ```yaml
> 50.82.0.0/20:
>    asn: 58302
>    description: an example
>    ignoreMorespecifics: false
> 
> options:
>  monitorASns:
>    58302:
>      group: default
> ```
> If in config.yml monitorAS is enabled, you will receive alerts every time a prefix not already part of the prefixes list is announced by AS58302.
> 
>If AS58302 starts announcing 45.230.23.0/24 an alert will be triggered. This happens because such prefix is not already monitored (it's not a sub prefix of 50.82.0.0/20).

You can generate the options block in the prefixes list automatically. Refer to the options `-s` and `-m` in the [auto genere prefixes documentation](prefixes.md#generate).

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |

    
### Reports

Possible reports are:

#### reportFile

This report module is the default one. It sends the alerts as verbose logs.
To configure the logs see the [configuration introduction](configuration.md).

#### reportEmail

This report module sends the alerts by email.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 
|senderEmail| The email address that will be used as sender for the alerts. | 
|smtp| A dictionary containing the SMTP configuration. Some parameters are described in `config.yml.example`. For all the options refer to the [nodemailer documentation](https://nodemailer.com/smtp/). | 
|notifiedEmails| A dictionary containing email addresses grouped by user groups.  (key: group, value: list of emails)| 
|notifiedEmails.default| The default user group. Each user group is a [list](prefixes.md#array) of emails. This group should contain at least the admin. | 



#### reportSlack

This report module sends alerts on Slack.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|colors| A dictionary having as key the event channel and as value a hex color (string). These colors will be used to make messages in Slack distinguishable. | 
|hooks| A dictionary containing Slack WebHooks grouped by user group (key: group, value: WebHook).| 
|hooks.default| The default user group. Each user group is a WebHook (url). | 


#### reportKafka

This report sends the alerts (including the BGP messages triggering them) to Kafka. By default it creates a topic `bgpalerter`.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|host| Host of the Kafka instance/broker (e.g. localhost).| 
|port| Port of the Kafka instance/broker (e.g. 9092).| 
|topics| A dictionary containing a mapping from BGPalerter channels to Kafka topics (e.g. `hijack: hijack-topic`). By default all channels are sent to the topic `bgpalerter` (`default: bgpalerter`) |
 
#### reportSyslog
 
This report module sends the alerts on Syslog.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 
|host| Host of the Syslog server (e.g. localhost).| 
|port| Port of the Syslog server  (e.g. 514).| 
|templates| A dictionary containing string templates for each BGPalerter channels. If a channel doesn't have a template defined, the `default` template will be used (see `config.yml.example` for more details). |

#### reportAlerta

This report module sends alerts to [Alerta](https://alerta.io/).

Parameters for this report module:

|Parameter| Description |
|---|---|
|severity| The alert severity as number for a specific event. See https://docs.alerta.io/en/latest/api/alert.html#alert-severities for the list of possible values. |
|key| Optional, the Alerta API key to use for authenticated requests. |
|token| Optional value used when executing HTTP requests to the Alerta API with bearer authentication. |
|resource_templates| A dictionary of string templates for each BGPalerter channels to generate the content of the `resource` field for the alert. If a channel doesn't have a template defined, the `default` template will be used (see `config.yml.example` for more details. |
|urls| A dictionary containing Alerta API URLs grouped by user group (key: group, value: API URL). |
|urls.default| The default user group. Each user group is an Alerta API URL. |
