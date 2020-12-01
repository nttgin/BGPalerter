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

You can also specify a template for each type of alert (channel).  
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
          {"fields": [ {"title": "Prefix:", "value": "${prefix}", "short": "false"},
          {"title": "Expected from:", "value": "AS ${asn}", "short": "true"},
          {"title": "Seen from:", "value": "AS ${neworigin}", "short": "true"},
          {"title": "Since:", "value": "${earliest}", "short": "true"},
          {"title": "Event description", "value": "${summary}"} ], 
          "text": "#bgpalerter #${type}", "color": "#ffffff"}]}'
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

Microsoft Teams is a proprietary business communication platform developed by Microsoft, as part of the Microsoft 365 family of products

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
                    "summary": "BGPAlerter has detected an issue",
                    "sections": [{
                        "activityTitle": "${summary}",
                        "activitySubtitle": "BGPAlerter has detected an issue",
                        "facts": [{
                            "name": "Prefix",
                            "value": "${prefix}"
                        }, {
                            "name": "Expected from",
                            "value": "AS ${asn}"
                        }, {
                            "name": "Seen from",
                            "value": "AS ${neworigin}"
                        }, {
                            "name": "Since:",
                            "value": "${earliest}"
                        }],
                        "markdown": true
                    }]
                }'
      isTemplateJSON: true
      headers:
      showPaths: 0 # Amount of AS_PATHs to report in the alert
      hooks:
        default: https: WEBHOOK_URL
```
