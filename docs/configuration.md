# Configuration

The entire configuration is contained in `config.yml`.

The following are common parameters which it is possible to specify in the configuration.

| Parameter | Description  | Expected format | Example  |  Required |
|---|---|---|---|---|
|notificationIntervalSeconds|Defines the amount of seconds after which an alert can be repeated. An alert is repeated only if the event that triggered it is not yet solved. Please, don't set this value to Infinity, use instead alertOnlyOnce. | An integer | 1800 | Yes |
|monitoredPrefixesFiles| The [list](prefixes.md#array) of files containing the prefixes to monitor. See [here](prefixes.md#prefixes) for more informations. | A list of strings (valid .yml files) | -prefixes.yml | Yes |
|logging| A dictionary of parameters containing the configuration for the file logging. | || Yes|
|logging.directory| The directory where the log files will be generated. The directory will be created if not existent. | A string | logs | Yes |
|logging.logRotatePattern| A pattern with date placeholders indicating the name of the file. This pattern will also indicate when a log file is rotated. | A string with date placeholders (YYYY, MM, DD, ss, hh) | YYYY-MM-DD | Yes |
|logging.compressOnRotation| Indicates if when a file gets rotates it has to be compressed or not. | A boolean | true | Yes |
|logging.maxFileSizeMB| Indicates the maximum file size in MB allowed before to be rotated. This allows to rotate files when logRotatePattern still the same but the file is too big | An integer | 15 | Yes |
|logging.maxRetainedFiles| Indicates the maximum amount of log files retained. When this threshold is passed, files are deleted. | An integer | 10 | Yes |
|checkForUpdatesAtBoot| Indicates if at each booth the application should check for updates. If an update is available, a notification will be sent to the default group. If you restart the process often (e.g. debugging, experimenting etc.) set this to false to avoid notifications. Anyway, BGPalerter checks for updates every 10 days.| A boolean | true | Yes |
|processMonitors| A list of modules allowing various ways to check for the status of BGPalerter (e.g. API, heartbeat). See [here](process-monitors.md) for more information. | | | No | 

The following are advanced parameters, please don't touch them if you are not doing research/experiments.

| Parameter | Description  | Expected format | Example  |  Required |
|---|---|---|---|---|
|environment| You can specify various environments. The values "production" (not verbose) and "development" (verbose) will affect the verbosity of the error/debug logs. The value "research" is explained [here](research.md). Other values don't affect the functionalities, they will be used to identify from which environment the log is coming from. | A string | production | Yes |
|alertOnlyOnce| A boolean that, if set to true, will prevent repetitions of the same alert in the future (which it doesn't make sense for production purposes). In this case notificationIntervalSeconds will be ignored. If set to true, the signature of all alerts will be cached in order to recognize if they already happened in the past. This may lead to a memory leak if the amount of alerts is considerable. | A boolean | false | No |
|pidFile| A file where the PID of the BGP alerter master process is recorded. | A string |  bgpalerter.pid | No |
|logging.backlogSize| Indicates the buffer dimension (number of alerts) before flushing it on the disk. This parameter plays a role only when receiving thousand of alerts per second in order to prevent IO starvation, in all other cases (e.g. production monitoring) it is irrelevant. | An integer | 15 | Yes | 
|maxMessagesPerSecond| A cap to the BGP messages received, over such cap the messages will be dropped. The default value is way above any production rate. Changing this value may be useful only for research measurements on the entire address space. | An integer | 6000 | No | 
|multiProcess| If set to true, the processing of the BGP messages will be distributed on two processes. This may be useful for research measurements on the entire address space. It is discouraged to set this to true for normal production monitoring. | A boolean | false | No | 
|fadeOffSeconds| If an alert is generated but cannot be yet squashed (e.g. not reached yet the `thresholdMinPeers`), it is inserted in a temporary list which is garbage collected after the amount of seconds expressed in `fadeOffSeconds`. Due to BGP propagation times, values below 5 minutes can result in false negatives.| An integer | 360 | No | 
|checkFadeOffGroupsSeconds| Amount of seconds after which the process checks for fading off alerts. | An integer | 30 | No | 



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
    params:
      persistAlertData: false
      alertDataDirectory: alertdata/
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
|carefulSubscription| If this parameter is set to true (default), the RIS server will stream only the data related to our prefix. This is an advanced parameter useful only for research purposes. |
|perMessageDeflate| Enable gzip compression on the connection. |

#### connectorTest

Connector used for testing purposes, it provokes all types of alerting. Needed to run the tests (`npm run test`) .


### Monitors

#### monitorHijack

This monitor has the logic to detect basic hijack.
In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* The origin AS of the prefix is different from the ones specified in the configuration.
* A more specific of the prefix has been announced by an AS which is different from the ones specified.
* The BGP update declares an AS_SET as origin and at least one of the AS in the AS_SET is not specified in the configuration.

Example of alert:
> The prefix 2a00:5884::/32 (description associated with the prefix) is announced by AS15563 instead of AS204092


Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|


#### monitorVisibility

This monitor has the logic to detect loss of visibility.
In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* The prefix is not visible anymore from at least `thresholdMinPeers` peers.

Example of alert:
> The prefix 165.254.225.0/24 (description associated with the prefix) has been withdrawn. It is no longer visible from 4 peers

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|

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

Example of alert:
> Matched "an example on path matching" on prefix 98.5.4.3/22 (including length violation) 1 times

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|



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


Example of alert:
> A new prefix 165.254.255.0/25 is announced by AS15562. It should be instead 165.254.255.0/24 (description associated with the prefix) announced by AS15562


Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|

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


Example of alert:
> AS2914 is announcing 2.2.2.3/22 but this prefix is not in the configured list of announced prefixes

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|
    
    
#### monitorRPKI

This monitor will listen for all announcements produced by the monitored Autonomous Systems and for all the announcements 
involving any of the monitored prefixes (independently from who is announcing them) and it will trigger an alert if any of the announcements is RPKI invalid or not covered by ROAs (optional).

This monitor is particularly useful when:
* you are deploying RPKI, since it will let you know if any of your announcements are 
invalid;
* after you deployed RPKI, in order to be sure that all future BGP configurations will be covered by ROAs.

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
> If in config.yml monitorRPKI is enabled, you will receive alerts every time:
>  * 50.82.0.0/20 is announced and it is not covered by ROAs or the announcement is RPKI invalid;
>  * AS58302 announces something that is not covered by ROAs or the announcement is RPKI invalid;


Example of alert:
> The route 103.21.244.0/24 announced by AS13335 is not RPKI valid.

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|checkUncovered| If set to true, the monitor will alert also for prefixes not covered by ROAs in addition of RPKI invalid prefixes. |
|preCacheROAs| This parameter allows to download locally VRPs lists. This is suggested in the case you want to validate many BGP updates (e.g. for research purposes). For normal production monitoring do NOT set this parameter. |
|refreshVrpListMinutes| If `preCacheROAs` is set to true, this parameter allows to specify a refresh time for the VRPs lists (it has to be > 15 minutes) |
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|

    
### Reports

Possible reports are:

#### reportFile

This report module is the default one. It sends the alerts as verbose logs.
To configure the logs see the [configuration introduction](configuration.md).

Parameters for this report module:

|Parameter| Description| 
|---|---|
|persistAlertData| If set to true, the BGP messages that triggered an alert will be collected in JSON files. The default is false.| 
|alertDataDirectory| If persistAlertData is set to true, this field must contain the directory where the JSON files with the BGP messages will be stored. | 



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
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 
|hooks| A dictionary containing Slack WebHooks grouped by user group (key: group, value: WebHook).| 
|hooks.default| The WebHook (URL) of the default user group.| 


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
Alerta is an open-source and easy to install dashboard that allows you to collect and monitor color-coded alerts.

Parameters for this report module:

|Parameter| Description |
|---|---|
|severity| The alert severity, e.g., ``critical``. See https://docs.alerta.io/en/latest/api/alert.html#alert-severities for the list of possible values. |
|environment| The Alerta environment name. If not specified, it'll use the BGPalerter environment name. |
|key| Optional, the Alerta API key to use for authenticated requests. |
|token| Optional value used when executing HTTP requests to the Alerta API with bearer authentication. |
|resourceTemplates| A dictionary of string templates for each channels to generate the content of the `resource` field for the alert. If a channel doesn't have a template defined, the `default` template will be used (see `config.yml.example` for more details). Read [here](context.md) how to write a template.|
|urls| A dictionary containing Alerta API URLs grouped by user group (key: group, value: API URL). |
|urls.default| The Alerta API URL of the default user group. |

> If you receive a 403 error in the BGPalerter error logs, try to check if you correctly set the ALLOWED_ENVIRONMENTS in /etc/alertad.conf. 
> In particular set ALLOWED_ENVIRONMENTS=['Production','Development'].

#### reportWebex

This report module sends alerts on [Webex Teams](https://teams.webex.com).

Parameters for this report module:

|Parameter| Description| 
|---|---|
|hooks| A dictionary containing Webex Teams WebHooks grouped by user group (key: group, value: WebHook).| 
|hooks.default| The WebHook (URL) of the default user group.| 

#### reportHTTP

This report module sends alerts on a generic HTTP end-point.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|hooks| A dictionary containing API URLs grouped by user group (key: group, value: URL).| 
|hooks.default| The URL of the default user group.| 
|templates| A dictionary containing string templates for each channels. If a channel doesn't have a template defined, the `default` template will be used (see `config.yml.example` for more details). Read [here](context.md) how to write a template. |
|isTemplateJSON| A boolean defining if the template provided above are JSON or plain string |
|headers| Additional headers to use in the GET request. For example for authentication.|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 


