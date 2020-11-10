# User Groups

BGPalerter supports user groups. With user groups you can:
* Notify only specific users about specific prefixes.
* Notify only specific users about specific type of alerts.

By default, BGPalerter creates two user groups `noc` and `default` (since v1.27.0).
* The `noc` user group receives only alerts related to the BGP monitoring. Even if set by default, this user group is optional. 
* The `default` user group receives administrative and error communications. Additionally, it receives all the alerts that could not be dispatched to any other specific user group. This group is mandatory, and it MUST be set for all the report modules.


You can create how many user groups you wish, for example to monitor resources of your customers and forward them the alerts about their resources without sending them administrative communications.

## Notify only specific users about specific prefixes

Example of configuration.

In prefixes.yml you can associate different groups to different resources.

```yml
165.254.225.0/24:
  description: my description 1
  asn: 2914
  ignoreMorespecifics: false
  ignore: false
  group: group1
 
165.254.255.0/24:
  description: my description 2
  asn: 2914
  ignoreMorespecifics: false
  ignore: false
  group: group1
 
192.147.168.0/24:
  description: my description 3
  asn: 15562
  ignoreMorespecifics: false
  ignore: false
  group: group2


options:
  monitorASns:
    2914:
      group: group1
    15562:
      group: group2
```


In config.yml you have to specify the groups in the report modules.

```yml
reports:
  - file: reportEmail
    channels:
      - hijack
      - newprefix
    params:
      notifiedEmails:
        default:
          - admin@org.com
        group1:
          - joh@example.com
          - max@example.com
        group2:
          - al@org.net

 - file: reportSlack
   channels:
     - hijack
     - newprefix
   params:
      hooks:
        default: _SLACK_WEBOOK_FOR_ADMIN_
        group1: _SLACK_WEBOOK_FOR_GROUP1_
        group2: _SLACK_WEBOOK_FOR_GROUP2_
```


## Notify only specific users about specific type of alerts

It's essentially the same configuration of above, except you have to duplicate report components, each serving a subset of the channels.

```yml
 - file: reportSlack
   channels:
     - hijack
   params:
      hooks:
        default: _SLACK_WEBOOK_FOR_ADMIN_
        group1: _SLACK_WEBOOK_FOR_GROUP2_

 - file: reportSlack
   channels:
     - newprefix
   params:
      hooks:
        default: _SLACK_WEBOOK_FOR_ADMIN_
        group2: _SLACK_WEBOOK_FOR_GROUP1_
```

You can also split the notification across different reporting mechanism based on their type.

```yml
reports:
  - file: reportEmail
    channels:
      - newprefix
    params:
      notifiedEmails:
        default:
          - admin@org.com
        group1:
          - joh@example.com
          - max@example.com

 - file: reportSlack
   channels:
     - hijack
   params:
      hooks:
        default: _SLACK_WEBOOK_FOR_ADMIN_
        group2: _SLACK_WEBOOK_FOR_GROUP2_
```
