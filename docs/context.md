# Report context      

All the report modules inherit the method `getContext` from the super class `Report`. This method returns a dictionary with some pre-computed tags useful for composing textual reports.
Such tags are reported in the table below.

| Tag | Description | 
|---|---|
| summary | The summary of the alert |
| earliest | The date of the earliest event that triggered the alert (format YYYY-MM-DD HH:mm:ss)|
| latest | The date of the last event that triggered the alert (format YYYY-MM-DD HH:mm:ss)|
| channel | The channel where the alert is coming from |
| type | The name of the monitor that triggered the alert |
| prefix | The monitored prefix involved in the alert |
| description | The description of the prefix involved in the alert |
| asn | The monitored AS involved in the alert |
| paths | The AS Paths involved in the alert |
| pathNumber | The count of AS Paths in the alert |
| peers | The number of peers that were able to see the issue |
| neworigin | The AS announcing the monitored prefix (e.g., in case of a hijack, `neworigin` will contain the hijacker, `asn` will contain the usual origin) |
| newprefix | The prefix announced (e.g., in case of a hijack, `newprefix` will contain the more specific prefix used for the hijack, `prefix` will contain the usual prefix) |
| bgplay | The link to BGPlay on RIPEstat |


Usage example: `The alert involves ${prefix} in ${earliest}` will be translated in something like `The alert involves 1.2.3.4/24 in 2020-04-14 04:02:13`.

> The same approach must be used to populate the templates available in config.yml. If you are writing a template for an API call, convert the JSON to string (e.g., '{"text": "${summary}"}').
