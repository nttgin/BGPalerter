# Composition

You can compose the tool with 3 main components: connectors, monitors, and reports.

* Connectors retrieve/listen to the data from different sources and transform them to a common format.
* Monitors analyze the data flow and produce alerts. Different monitors try to detect different issues.
* Reports send/store the alerts, e.g. by email or to a file.

This is what it looks like in `config.yml`:

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



## Connectors

### connectorRIS
It connects to RIPE RIS https://ris-live.ripe.net/ and receives BGP updates coming from 600+ peers.

Parameters for this connector module:

|Parameter| Description| 
|---|---|
|url| WebSocket end-point of RIS, which currently is `wss://ris-live.ripe.net/v1/ws/` |
|subscription| Dictionary containing the parameters required by RIS. Refer to the [official documentation](https://ris-live.ripe.net/) for details.|

### connectorTest

Connector used for testing purposes, it provokes all types of alerting. Needed to run the tests (`npm run test`) .


## Monitors

### monitorHijack

This monitor has the logic to detect basic hijack.
In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* The origin AS of the prefix is different from the ones specified in the configuration.
* A more specific of the prefix has been announced by an AS which is different from the ones specified.
* The BGP update declares an AS_SET as origin and at least one of the AS in the AS_SET is not specified in the configuration.

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |


### monitorVisibility

This monitor has the logic to detect loss of visibility.
In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* The prefix is not visible anymore from at least `thresholdMinPeers` peers.

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |


### monitorNewPrefix

This monitor has the logic to detect unexpected change of configuration in the form of new prefixes announced by the correct AS.
In particular, it will monitor for all the declared prefixes and will trigger an alert when:
* A sub-prefix of the monitored prefix starts to be announced by the same AS declared for the prefix.

Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |



## Reports

Possible reports are:

### reportFile

This report module is the default one. It sends the alerts as verbose logs.
To configure the logs see the [configuration introduction](configuration.md).

### reportEmail

This report module sends the alerts by email.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 
|senderEmail| The email address that will be used as sender for the alerts. | 
|smtp| A dictionary containing the SMTP configuration. Some parameters are described in `config.yml.example`. For all the options refer to the [nodemailer documentation](https://nodemailer.com/smtp/). | 
|notifiedEmails| A dictionary containing email addresses grouped by user groups.  (key: group, value: list of emails)| 
|notifiedEmails.default| The default user group. Each user group is a [list](prefixes.md#array) of emails. This group should contain at least the admin. | 



### reportSlack

This report module sends alerts on Slack.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|colors| A dictionary having as key the event channel and as value a hex color (string). These colors will be used to make messages in Slack distinguishable. | 
|hooks| A dictionary containing Slack WebHooks grouped by user group (key: group, value: WebHook).| 
|hooks.default| The default user group. Each user group is a WebHook (url). | 


### reportKafka

This report sends the alerts (including the BGP messages triggering them) to Kafka. By default it creates a topic `bgpalerter`.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|host| Host and port of the Kafka instance/broker (e.g. localhost:9092).| 
|topics| A dictionary containing a mapping from BGPalerter channels to Kafka topics (e.g. `hijack: hijack-topic`). By default all channels are sent to the topic `bgpalerter` (`default: bgpalerter`) |
 