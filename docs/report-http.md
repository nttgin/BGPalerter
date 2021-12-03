# Send alerts with POST requests

BGPalerter can send alerts by means of POST requests to a provided URL.
This can be done by configuring the module reportHTTP. Read [here](configuration.md#reporthttp) to understand how.

For configuring reportHTTP, essentially you need to specify two things: 
* The URL
* A template of the POST request.

If you are using [user groups](usergroups.md), you can specify a URL for every user group. This can be done inside `hooks`, a dictionary containing API URLs grouped by user group (key: group, value: URL).
The default user group is mandatory.  
Example:
```yaml
      hooks:
        default: https://MY_WEB_HOOK/
        noc: https://MY_WEB_HOOK_FOR_THE_NOC_GROUP
```

You can also specify a template for each type of alert (channel). More information about templates is available [here](context.md).
Example:
```yaml
      isTemplateJSON: true
      templates:
        default: '{"message": "${summary}", "color": "blue"}'
        visibility: '{"message": "${summary}", "color": "orange"}'
```

Templates are expressed as strings. If the parameter `isTemplateJSON` is set to true, the string will be converted to JSON before to be posted.

What follows is a list of examples showing how to adapt this module to some well-known applications.


## Mattermost

Mattermost is an open source messaging platform.

```yaml
reports:
  - file: reportHTTP
    channels:
      - hijack
      - newprefix
      - visibility
      - path
      - misconfiguration
      - rpki
    params:
      templates:
        default: '{"attachments": [
              {
                "author_name" : "BGPalerter",
                "fields": [ 
                      {"title": "Event type:", "value": "${type}", "short": "true"},
                      {"title": "First event:", "value": "${earliest} UTC", "short": "true"},
                      {"title": "Last event:", "value": "${latest} UTC", "short": "true"}
                ], 
                "text": "${channel}: ${summary}", "color": "#ffffff"
              }
          ]}'
      isTemplateJSON: true
      headers:
      showPaths: 0 # Amount of AS_PATHs to report in the alert
      hooks:
        default: WEBHOOK_URL
```
Thanks to [@fstolba](https://github.com/nttgin/BGPalerter/issues/81).

## Pushover

Pushover is an app that makes it easy to get real-time notifications on your Android, iPhone, iPad, and Desktop.

```yaml
- file: reportHTTP
   channels:
     - hijack
     - newprefix
     - visibility
     - path
     - misconfiguration
     - rpki
   params:
     templates:
       default: '{"message": "${channel}: ${summary}", "title": "BGPalerter", "priority": "1", "token": "_YOUR_API_TOKEN_HERE_", "user": "_YOUR_USER_KEY_HERE_"}'
     headers:
     isTemplateJSON: true
     showPaths: 0
     hooks:
       default: https://api.pushover.net/1/messages.json
```

Thanks to [Hugo Salgado](https://twitter.com/huguei/status/1278771420525408258).

## MS Teams

Microsoft Teams is a communication platform developed by Microsoft, as part of the Microsoft 365 family of products.

```yaml
reports:
  - file: reportHTTP
    channels:
      - hijack
      - newprefix
      - visibility
      - path
      - misconfiguration
      - rpki
    params:
      templates:
        default: '{
                    "@type": "MessageCard",
                    "@context": "http://schema.org/extensions",
                    "themeColor": "d76100",
                    "summary": "BGPalerter",
                    "sections": [{
                        "activityTitle": "BGPalerter",
                        "activitySubtitle": "${channel}",
                        "facts": [{
                            "name": "Summary",
                            "value": "${summary}"
                        }, {
                            "name": "Event type",
                            "value": "${type}"
                        }, {
                            "name": "First event",
                            "value": "${earliest} UTC"
                        }, {
                            "name": "Last event",
                            "value": "${latest} UTC"
                        }],
                        "markdown": true
                    }]
                }'
      isTemplateJSON: true
      headers:
      showPaths: 0 # Amount of AS_PATHs to report in the alert
      hooks:
        default: https://WEBHOOK_URL
```

Thanks [arpanet-creeper](https://github.com/nttgin/BGPalerter/pull/412) for the help.


## RocketChat

[RocketChat](https://rocket.chat/) is an open source messaging platform.

```yaml
- file: reportHTTP
   channels:
     - hijack
     - newprefix
     - visibility
     - path
     - misconfiguration
     - rpki
   params:
     templates:
       default: '{"username": "BGPalerter", "channel": "_CHANNEL_NAME_", "text": "${channel}: ${summary}"}'
     headers:
     isTemplateJSON: true
     showPaths: 0
     hooks:
       default: 'https://_RC_URL/hooks/_YOUR_KEY_
```

> Configure the "_CHANNEL_NAME_" in the template. Start with @ for user or # for channel. Eg: @john or #general

Thanks to [cadirol](https://github.com/nttgin/BGPalerter/pull/704).
