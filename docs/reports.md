# Reports

Reports send/store the alerts, e.g., by email or to a file. Reports can also provide the data triggering such alerts.

After configuring a report module, you can run the BGPalerter binary with the option `-t` to test the configuration.
This will generate fake alerts. [Read more here](installation.md#bgpalerter-parameters).

> By default all communications will be sent to the default user group, so it is not mandatory to configure any user group.
> Note that the default group is used also for administrative and error communications, if you want to filter out such communications you need to [create another user group](usergroups.md).

#### Possible reports are:

- [reportFile](reports.md#reportFile)
- [reportEmail](reports.md#reportEmail)
- [reportSlack](reports.md#reportSlack)
- [reportKafka](reports.md#reportKafka)
- [reportSyslog](reports.md#reportSyslog)
- [reportAlerta](reports.md#reportAlerta)
- [reportWebex](reports.md#reportWebex)
- [reportHTTP](reports.md#reportHTTP)
- [reportTelegram](reports.md#reportTelegram)
- [reportPullAPI](reports.md#reportPullAPI)
- [reportMatrix](reports.md#reportMatrix)

## reportFile

This report module is the default one. It sends the alerts as verbose logs.
To configure the logs see the [configuration introduction](configuration.md).

Parameters for this report module:

|Parameter| Description| 
|---|---|
|persistAlertData| If set to true, the BGP messages that triggered an alert will be collected in JSON files. The default is false.|
|alertDataDirectory| If persistAlertData is set to true, this field must contain the directory where the JSON files with the BGP messages will be stored. |

## reportEmail

This report module sends the alerts by email.

Read [here](context.md) how to write a template.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 
|senderEmail| The email address that will be used as sender for the alerts. | 
|smtp| A dictionary containing the SMTP configuration. Some parameters are described in `config.yml.example`. For all the options refer to the [nodemailer documentation](https://nodemailer.com/smtp/). | 
|notifiedEmails| A dictionary containing email addresses grouped by user groups.  (key: group, value: list of emails)| 
|notifiedEmails.default| The default user group. Each user group is a [list](prefixes.md#array) of emails. This group should contain at least the admin. | 

After configuring this module, [test the configuration](installation.md#bgpalerter-parameters) (`-t` option) to be sure everything will work once in production.

## reportSlack

This report module sends alerts on Slack.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|colors| A dictionary having as key the event channel and as value a hex color (string). These colors will be used to make messages in Slack distinguishable. | 
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 
|hooks| A dictionary containing Slack WebHooks grouped by user group (key: group, value: WebHook).| 
|hooks.default| The WebHook (URL) of the default user group.| 
|noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |

## reportKafka

This report sends the alerts (including the BGP messages triggering them) to Kafka. By default it creates a topic `bgpalerter`.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|host| Host of the Kafka instance/broker (e.g., localhost).| 
|port| Port of the Kafka instance/broker (e.g., 9092).| 
|topics| A dictionary containing a mapping from BGPalerter channels to Kafka topics (e.g., `hijack: hijack-topic`). By default all channels are sent to the topic `bgpalerter` (`default: bgpalerter`) |

## reportSyslog

This report module sends the alerts on Syslog.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). | 
|host| Host of the Syslog server (e.g., localhost).| 
|port| Port of the Syslog server  (e.g., 514).| 
|transport| The transport protocol to use. Two options: `udp` or `tcp`| 
|templates| A dictionary containing string templates for each BGPalerter channels. If a channel doesn't have a template defined, the `default` template will be used (see `config.yml.example` for more details). |

## reportAlerta

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
|noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |
|urls| A dictionary containing Alerta API URLs grouped by user group (key: group, value: API URL). |
|urls.default| The Alerta API URL of the default user group. |

> If you receive a 403 error in the BGPalerter error logs, try to check if you correctly set the ALLOWED_ENVIRONMENTS in /etc/alertad.conf.
> In particular set ALLOWED_ENVIRONMENTS=['Production','Development'].

## reportWebex

This report module sends alerts on [Webex Teams](https://teams.webex.com).

Parameters for this report module:

|Parameter| Description| 
|---|---|
|hooks| A dictionary containing Webex Teams WebHooks grouped by user group (key: group, value: WebHook).| 
|hooks.default| The WebHook (URL) of the default user group.| 
|noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |

## reportHTTP

This report module sends alerts on a generic HTTP end-point.

Parameters for this report module:

| Parameter      | Description| 
|----------------|---|
| hooks          | A dictionary containing API URLs grouped by user group (key: group, value: URL).| 
| hooks.default  | The URL of the default user group.| 
| templates      | A dictionary containing string templates for each channels. If a channel doesn't have a template defined, the `default` template will be used (see `config.yml.example` for more details). Read [here](context.md) how to write a template. |
| noProxy        | If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |
| isTemplateJSON | A boolean defining if the template provided above are JSON or plain string |
| headers        | Additional headers to use in the GET request. For example for authentication.|
| showPaths      | Amount of AS_PATHs to report in the alert (0 to disable). | 
| method         | One of `post`, `put`, `patch`, `delete`. Default to `post`. |

[See here some examples of how to adapt reportHTTP to some common applications.](report-http.md)

## reportTelegram

This report module sends alerts directly to specified Telegram users, groups, or channels.
To send alert to Telegram you need to create a bot.

To create a bot:
1. Open Telegram, search `@botfather` and open a chat with it.
2. Type `/newbot` and follow the procedure to create a bot.
3. Take note of the bot ID provided.
4. Open the chat (channel, group, user) where you want to send the alerts.
5. Write something in the chat (from whatever user).
6. Visit `https://api.telegram.org/bot_BOT_ID_/getUpdates` (replace `_BOT_ID_` with your bot ID) from your browser and take note of the chat ID returned in the answer. In case of multiple chat IDs, use the one with the same text you sent at the previous point.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). |
|botUrl| The Telegram bot URL. Usually `https://api.telegram.org/bot_BOT_ID_/` where `_BOT_ID_` is your both ID. |
|noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |
|chatIds| A dictionary containing chat IDs grouped by user group (key: group, value: chat ID).| 
|chatIds.default| The chat ID of the default user group.| 

## reportPullAPI

This report module creates a REST API reachable at `http://host:port/alerts/`. The API provides the list of generated alerts and some metadata (including the timestamp of the last time the API was queried).

The REST API uses the generic `rest` configuration in `config.yml`. Read [here](configuration.md) or see `config.yml.example` for more information.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|maxAlertsAmount| The maximum amount of alerts the API will return. By default set to 100. Don't exagerate with the number, the greater this value is the more memory BGPalerter will use. |
|noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |

## reportMatrix

This report module sends alerts directly to a specific Matrix room.
To send alert to Matrix you need an access token and a room ID.

Parameters for this report module:

|Parameter| Description| 
|---|---|
|showPaths| Amount of AS_PATHs to report in the alert (0 to disable). |
|homeserverUrl:| URL of your Matrix homeserver (for example: `https://matrix.org` |
|noProxy| If there is a global proxy configuration (see [here](http-proxy.md)), this parameter if set to true allows the single module to bypass the proxy. |
|roomIds| A dictionary containing chat IDs grouped by user group (key: group, value: room ID).| 
|roomIds.default| The room ID of the default room.| 


