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
|logging.useUTC| If set to true, logs will be reported in UTC time. Is set to false or missing, the timezone of the machine will be used. This parameter affects only the timestamp reported at the beginning of each log entry, it doesn't affect the time reported in the data/alerts which is always in UTC.  | A boolean | true | No |
|checkForUpdatesAtBoot| Indicates if at each booth the application should check for updates. If an update is available, a notification will be sent to the default group. If you restart the process often (e.g., debugging, experimenting etc.) set this to false to avoid notifications. Anyway, BGPalerter checks for updates every 10 days.| A boolean | true | Yes |
|processMonitors| A list of modules allowing various ways to check for the status of BGPalerter (e.g., API, heartbeat). See [here](process-monitors.md) for more information. | | | No | 
|httpProxy| Defines the HTTP/HTTPS proxy server to be used by BGPalerter and its submodules (reporters/connectors/monitors). See [here](http-proxy.md) for more information. | A string | http://usr:psw@ prxy.org:8080 | No |
|persistStatus| If set to true, when BGPalerter is restarted the list of alerts already sent is recovered. This avoids duplicated alerts. The process must be able to write on disc inside `.cache/`. | A boolean | true | No |
|generatePrefixListEveryDays| This parameter allows to automatically re-generate the prefix list after the specified amount of days. Set to 0 to disable it. It works only if you have one prefix list file and if you have used BGPalerter to automatically generate the file (and not if you edited prefixes.yml manually). | An integer | 0 | No |
|rpki| A dictionary containing the RPKI configuration (see [here](rpki.md) for more details). |  |  | Yes |
|groupsFile| A file containing user groups definition (see [here](usergroups.md) for more details). | A string | groups.yml | No | 
|rest| A dictionary containing the parameters to run the server for all APIs provided by BGPalerter. | | | No | 
|rest.host| The IP/host on which the APIs will be reachable. The default value is localhost, this means the API will not be reachable from another host. To make it public use null or 0.0.0.0. | A string or null | localhost | No | 
|rest.port| The port of the REST API. The default value is 8011. | An integer | 8011 | No | 

The following are advanced parameters, please don't touch them if you are not doing research/experiments.

| Parameter | Description  | Expected format | Example  |  Required |
|---|---|---|---|---|
|environment| You can specify various environments. The values "production" (not verbose) and "development" (verbose) will affect the verbosity of the error/debug logs. The value "research" is explained [here](research.md). Other values don't affect the functionalities, they will be used to identify from which environment the log is coming from. | A string | production | Yes |
|alertOnlyOnce| A boolean that, if set to true, will prevent repetitions of the same alert in the future (which it doesn't make sense for production purposes). In this case notificationIntervalSeconds will be ignored. If set to true, the signature of all alerts will be cached in order to recognize if they already happened in the past. This may lead to a memory leak if the amount of alerts is considerable. | A boolean | false | No |
|pidFile| A file where the PID of the BGP alerter main process is recorded. | A string |  bgpalerter.pid | No |
|maxMessagesPerSecond| A cap to the BGP messages received, over such cap the messages will be dropped. The default value is way above any production rate. Changing this value may be useful only for research measurements on the entire address space. | An integer | 6000 | No | 
|multiProcess| If set to true, the processing of the BGP messages will be distributed on two processes. This may be useful for research measurements on the entire address space. It is discouraged to set this to true for normal production monitoring. | A boolean | false | No | 
|fadeOffSeconds| If an alert is generated but cannot be yet squashed (e.g., not reached yet the `thresholdMinPeers`), it is inserted in a temporary list which is garbage collected after the amount of seconds expressed in `fadeOffSeconds`. Due to BGP propagation times, values below 5 minutes can result in false negatives.| An integer | 360 | No | 
|checkFadeOffGroupsSeconds| Amount of seconds after which the process checks for fading off alerts. | An integer | 30 | No | 
|volume| Defines a directory that will contain all the files used by BGPalerter. See [here](installation.md#volume) before modifying this. | A string | /home/bgpalerter/ | No | 




## Composition

You can compose the tool with 3 main components: connectors, monitors, and reports.

* Connectors retrieve/listen to the data from different sources and transform them to a common format.
* Monitors analyze the data flow and produce alerts. Different monitors try to detect different issues.
* Reports send/store the alerts, e.g., by email or to a file. Reports can also provide the data triggering such alerts.

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
| file | Name of the file containing the monitor implementation. Monitor implementations are in the `monitors` directory. |
| channel | The name of the channel that will be used by the monitor to dispatch messages. If the inserted name doesn't correspond to an already existent channel, a new channel is created.|
|name| The name associated to the monitor. Multiple monitors with the same implementation can be loaded with different names. This name will be used to annotate messages in order track from where they are coming from.|
|params| A dictionary of parameters that can be useful for the functioning of the monitor. Different monitors with the same implementation can be initialized with different parameters. |
|params.noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. | 

Each report declaration is composed of:

| Attribute | Description |
|---|---|
| file | Name of the file containing the report implementation. Report implementations are in the `reports` directory. |
|params| A dictionary of parameters that can be useful for the functioning of the report. It is common to have group declarations among the parameters. Different reports with the same implementation can be initialized with different parameters. |
|params.noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |
|channels| A [list](docs/prefixes.md#array) of channels the report module will listen (never write). Different reports with the same implementation can be initialized with a different list of channels to listen.|


Each connector is composed of:

| Attribute | Description |
|---|---|
|file|Name of the file containing the connector implementation. Report implementations are in the `connectors` directory. |
|params| A dictionary of parameters that can be useful for the functioning of the connector.  E.g. the data source url, password, socket options|
|params.noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. | 
|name| The name that will be used to identify this connector and to annotate logs and messages. | 


> Connectors will always send the BGP updates to all the channels. The BGP updates have all the same format.



### Connectors
Connectors retrieve/listen to the data from different sources and transform them to a common format.

Possible connectors are:

#### connectorRIS
It connects to RIPE RIS https://ris-live.ripe.net/ and receives BGP updates coming from 600+ peers.

Parameters for this connector module:

|Parameter| Description| 
|---|---|
|url| WebSocket end-point of RIS, which currently is `ws://ris-live.ripe.net/v1/ws/` |
|subscription| Dictionary containing the parameters required by RIS. Refer to the [official documentation](https://ris-live.ripe.net/) for details.|
|carefulSubscription| If this parameter is set to true (default), the RIS server will stream only the data related to our prefix. This is an advanced parameter useful only for research purposes. |
|perMessageDeflate| Enable gzip compression on the connection. |

#### connectorRISDump
It connects to the RIPEstat's BGPlay API and retrieves a RIS dump about the monitored resources. The retrieved dump is 2 hours old, due to limitations on the API side. 

Without this connector, when you start BGPalerter the monitoring will start based on new BGP updates. This means that you will not receive alerts before a new BGP update is propagated; e.g., if one of your prefixes is already hijacked when you start BGPalerter, you will not get notified immediately.

This connector runs only in the two following conditions:
- you enable it in the config.yml (commented out by default);
- you didn't start BGPalerter in the last two hours.


#### connectorTest

Connector used for testing purposes, it provokes all types of alerting. Needed to run the tests (`npm run test`) .


### Monitors
Monitors analyze the data flow and produce alerts. Different monitors try to detect different issues.

Possible monitors are:

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
>   asn: 15562
>   description: an example on path matching
>   ignoreMorespecifics: false
>   path:
>     - match: ".*2194,1234$"
>       notMatch: ".*5054.*"
>       matchDescription: detected scrubbing center
>     - match: ".*123$"
>       notMatch: ".*5056.*"
>       matchDescription: other match
> ```

Path is a list of matching rules, in this way multiple matching rules can be defined for the same prefix (rules are in OR).

More about path matching [here](path-matching.md).

> An alert will be generated for example when a BGP announcements for 165.254.255.0/24 or a more specific contains an AS_PATH 
> terminating in 2194,1234 but not containing 5054. The generated alert will report the matchDescription field.

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
> If in config.yml monitorNewPrefix is enabled you will receive alerts every time a more specific prefix (e.g., 50.82.4.0/24) is announced by AS58302.


Example of alert:
> A new prefix 165.254.255.0/25 is announced by AS15562. It should be instead 165.254.255.0/24 (description associated with the prefix) announced by AS15562


Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|

#### monitorAS

This monitor will listen for all announcements produced by the monitored Autonomous Systems and will detect when a prefix, which is not in the monitored prefixes list, is announced.
This is useful if you want to be alerted in case your AS starts announcing something you didn't intend to announce (e.g., misconfiguration, typo).


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
> If AS58302 starts announcing 45.230.23.0/24 an alert will be triggered. This happens because such prefix is not already monitored (it's not a sub prefix of 50.82.0.0/20).

You can generate the options block in the prefixes list automatically. Refer to the options `-s` and `-m` of the [auto configuration](prefixes.md#generate).


Example of alert:
> AS2914 is announcing 2.2.2.3/22 but this prefix is not in the configured list of announced prefixes

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|
    
    
#### monitorRPKI

This monitor will listen for all announcements produced by the monitored Autonomous Systems and for all the announcements 
involving any of the monitored prefixes (independently of who is announcing them), and it will trigger an alert if any of the announcements is RPKI invalid or not covered by ROAs (optional).

This monitor is particularly useful when:
* Before RPKI deployment, since it will let you test what announcements will be invalid after creating the ROAs.
* During RPKI deployment, since it will let you know if any of your announcements are invalid.
* After you deployed RPKI, in order to be sure all future BGP configurations will be covered by ROAs.

> Example: 
> The prefixes list of BGPalerter has the following entries:
> ```yaml
> 103.21.244.0/24:
>    asn: 13335
>    description: an example
>    ignoreMorespecifics: false
> 
> options:
>  monitorASns:
>    13335:
>      group: default
> ```
> If in config.yml monitorRPKI is enabled, you will receive alerts every time:
>  * 103.21.244.0/24 is announced and it is not covered by ROAs, or the announcement is RPKI invalid;
>  * AS13335 announces something that is not covered by ROAs, or the announcement is RPKI invalid;
>  * A prefix you announce used to be covered by a ROA but such ROA is no longer available (e.g., RPKI repositories past failures: [ARIN](https://www.arin.net/announcements/20200813/), [RIPE NCC](https://www.ripe.net/support/service-announcements/accidental-roa-deletion))


Examples of alerts:
> The route 103.21.244.0/24 announced by AS13335 is not RPKI valid  
> The route 1.2.3.4/24 announced by AS1234 is not covered by a ROA  
> The route 1.2.3.4/24 announced by AS1234 is no longer covered by a ROA  

You need to configure your RPKI data source as described [here](rpki.md).

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|checkUncovered| If set to true, the monitor will alert also for prefixes not covered by ROAs in addition of RPKI invalid prefixes. |
|checkDisappearing| If set to true, the monitor will check also for disappearing ROAs. Important: set this feature to false if you have monitorROAS enabled; monitorROAS provides diffs including disappearing ROAs. |
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|
|cacheValidPrefixesSeconds| Amount of seconds ROAs get cached in order to identify RPKI repository malfunctions (e.g., disappearing ROAs). Default to 7 days. |


#### monitorROAS

This monitor will periodically check the ROAs involving any of your ASes or prefixes.
In particular, it will report about: ROAs involving your resources being edited, added or removed; expiring ROAs; TA malfunctions.
You need to configure your RPKI data source as described [here](rpki.md).
Note, while BGPalerter will perform the check near real time, many RIRs have delayed ROAs publication times.


> Example: 
> The prefixes list of BGPalerter has the following entries:
> ```yaml
> 1.2.3.4/24:
>    asn: 1234
>    description: an example
>    ignoreMorespecifics: false
>    group: noc1
> 
> options:
>  monitorASns:
>    2914:
>      group: noc2
> ```
> If in config.yml monitorROAS is enabled, you will receive alerts every time:
>  * A ROA that is, or was, involving 1.2.3.4/24 is added/edited/removed (based on the prefix `1.2.3.4/24` matching rule).
>  * A ROA that is, or was, involving AS2914 is added/edited/removed (based on the `monitorASns` section).

**Important 1:** for a complete monitoring, configure also the `monitorASns` section. Setting only prefix matching rules is not sufficient: prefix matching rules are based on the longest prefix match, less specific ROAs impacting the prefix will NOT be matched. On the other side, setting only the `monitorASns` section is instead perfectly fine for ROA monitoring purposes.

**Important 2:** prefix matching rules have always priorities on `monitorASns` rules. If an alert matches both a prefix rule and an AS rule, it will be sent only to the prefix rule, except if the `checkOnlyASns` params is set to true (see parameters below). In the example above, a ROA change impacting `1.2.3.4/24` is only sent to the user group `noc1` and not to `noc2`; whatever other ROA change impacting a prefix not in the list (no prefix matching rule) will be sent to `noc2` instead.

**Important 3:** alerts about the generic health status of TAs are generated according to the provided VRP file. This types of alerts are not necessarily related to the monitored resources and they are send to the `default` user group.

Example of alerts:
> ROAs change detected: removed <1.2.3.4/24, 1234, 25, apnic>; added <5.5.3.4/24, 1234, 25, apnic>
> 
> Possible TA malfunction: 24% of the ROAs disappeared from APNIC

**This monitor also alerts about ROAs expiration.**

**Note:** This feature requires a vrp file having an `expires` field for each vrp, currently supported only by [rpki-client](https://www.rpki-client.org/). To enable this feature, provide a file generated with rpki-client (version 7.1 and newer) or use `vrpProvider: rpkiclient` in your rpki configuration ([more info](rpki.md)).

ROAs are affected by a series of expiration times:
* Certificate Authority's "notAfter" date;
* each CRL's "nextUpdate" date;
* each manifest's EE certificate notAfter, and each manifests eContent "nextUpdate";
* the ROA's own EE certificate "notAfter".

The field `expire` must be the closest expiration time of all of the above.

Example of alerts:
> The following ROAs will expire in less than 2 hours: <1.2.3.4/24, 1234, 25, apnic>; <5.5.3.4/24, 1234, 25, apnic>
> 
> Possible TA malfunction: 24% of the ROAs are expiring in APNIC


Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|enableDiffAlerts| Enables alerts showing edits impacting ROAs for the monitored resources. Default true|
|enableExpirationAlerts| Enables alerts about expiring ROAs. Default true.|
|enableExpirationCheckTA| Enables alerts about TA malfunctions detected when too many ROAs expire in the same TA. Default true.|
|enableDeletedCheckTA| Enables alerts about TA malfunctions detected when too many ROAs are deleted in the same TA. Default true.|
|roaExpirationAlertHours| If a ROA is expiring in less than this amount of hours, an alert will be triggered. The default is 2 hours. I strongly suggest to keep this value, ROAs are almost expiring every day, read above what this expiration time means. |
|checkOnlyASns| If set to true (default), ROAs diff alerts will be generated based only on the ASns contained in the `monitorASns` of `prefixes.yml`. This means that no ROA diffs will be matched against prefix matching rules (see example above).  If you are monitoring the origin AS of your prefixes, leave this option to true to avoid noise.|
|toleranceExpiredRoasTA|The percentage of expiring ROAs in a single TA tolerated before triggering a TA malfunction alert. Default 20.|
|toleranceDeletedRoasTA|The percentage of deleted ROAs in a single TA tolerated before triggering a TA malfunction alert. Default 20.|

#### monitorPathNeighbors

The component `monitorPathNeighbors` allows to monitor for unexpected neighbor ASes in AS paths. The list of neighbors can be specified in `prefixes.yml` inside the `monitorASns` sections.

Refer to the [documentation for this monitor](path-neighbors.md).


# Reports

Reports send/store the alerts, e.g., by email or to a file. Reports can also provide the data triggering such alerts.
Refer to the [report's documentation](reports.md).
    
