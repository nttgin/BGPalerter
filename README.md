[![Build Status](https://travis-ci.org/nttgin/BGPalerter.svg?branch=master)](https://travis-ci.org/nttgin/BGPalerter)
![Dependabot Status](https://badgen.net/dependabot/nttgin/BGPalerter/?icon=dependabot)
[![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com)

# BGPalerter
Self-configuring BGP monitoring tool, which allows you to monitor in **real-time** if:
* any of your prefixes loses visibility;
* any of your prefixes is hijacked;
* your AS is announcing RPKI invalid prefixes (e.g., not matching prefix length);
* your AS is announcing prefixes not covered by ROAs;
* ROAs covering your prefixes are no longer reachable (e.g., TA malfunction);
* a ROA involving any of your prefixes or ASes was deleted/added/edited;
* your AS is announcing a new prefix that was never announced before;
* one of the AS path used to reach your prefix matches a specific condition defined by you.

You just run it. You don't need to provide any data source or connect it to anything in your network since it connects to [public repos](docs/datasets.md).

It can deliver alerts on files, by email, on slack, and more.

![BGPalerter](https://massimocandela.com/img/bgpalerter_github_image.png)

> BGPalerter connects to public BGP data repos (not managed by NTT), and the entire monitoring is done directly in the application (there are no NTT servers involved). 
 
## TL;DR (1 minute setup)
> This section is useful if you don't care about the source code but you just want to run the monitor.
Instead, if you want to run the source code (which is completely open) or develop, please read directly the documentation.

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases) (be sure to select the one for your OS)

2. Execute the binary (e.g. `chmod +x bgpalerter-linux-x64 && ./bgpalerter-linux-x64`)  
The first time you run it, the auto-configuration will start.  


If something happens (e.g. a hijack) you will see the alerts in `logs/reports.log`.
In `config.yml` you can find other reporting mechanisms (e.g. email, Slack, Kafka) in addition to logging on files. 
Please uncomment the related section and configure according to your needs. 

If the installation doesn't go smoothly, read [here](docs/installation.md).  
Read the documentation below for more options.

## Documentation

- [Installation](docs/installation.md)
    - [Run from binary](docs/installation.md#running-bgpalerter-from-binaries)
    - [Run from source code](docs/installation.md#running-bgpalerter-from-the-source-code)
    - [Run in Docker](docs/installation.md#running-bgpalerter-in-docker)
    - [Run as a Linux service](docs/linux-service.md)
    - [Command line options](docs/installation.md#bgpalerter-parameters)
- [Monitored prefixes list](docs/prefixes.md#prefixes)
    - [Generate prefix list](docs/prefixes.md#generate)
    - [Prefix attributes description](docs/prefixes.md#prefixes-fields)
- [Configuration](docs/configuration.md)
    - [Composition](docs/configuration.md#composition)
    - [Monitor for](docs/configuration.md#monitors)
        - [Hijacks](docs/configuration.md#monitorhijack)
        - [Visibility loss](docs/configuration.md#monitorvisibility)
        - [RPKI invalid announcements](docs/configuration.md#monitorrpki)
        - [RPKI ROAs diffs](docs/configuration.md#monitorroas)
        - [Announcements of more specifics](docs/configuration.md#monitornewprefix)
        - [Announcements of new prefixes](docs/configuration.md#monitoras)
        - [Path matching](docs/configuration.md#monitorpath)
    - [Send alerts to](docs/configuration.md#reports)
        - [File](docs/configuration.md#reportfile)
        - [E-mail](docs/configuration.md#reportemail)
        - [Slack](docs/configuration.md#reportslack)
        - [Kafka](docs/configuration.md#reportkafka)
        - [Syslog](docs/configuration.md#reportsyslog)
        - [Alerta dashboard](docs/configuration.md#reportalerta)
        - [Webex](docs/configuration.md#reportwebex)
        - [HTTP URL](docs/configuration.md#reporthttp)
        - [Telegram](docs/configuration.md#reporttelegram)
        - [Mattermost](docs/report-http.md#mattermost)
        - [Pushover](docs/report-http.md#pushover)
        - [Microsoft Teams](docs/report-http.md#ms-teams)
    - [Test report configuration](docs/installation.md#bgpalerter-parameters)
    - [Process/Uptime monitoring](docs/process-monitors.md)
    - [Notification user groups](docs/usergroups.md)
    - [RPKI configuration](docs/rpki.md)
    - [HTTP/HTTPS proxy](docs/http-proxy.md)
- [Update to latest version](docs/update.md)
- [More information for developers](docs/develop.md)
    - [All npm commands](docs/develop.md#all-npm-commands)
    - [Git flow](docs/release-process.md#git-flow)
    - [Report context](docs/context.md)
    - [Release process](docs/release-process.md)
- [BGPalerter for researchers](docs/research.md)
- [Release process and Git flow](docs/release-process.md)


If you are using BGPalerter, feel free to sign here: [Who is using BGPalerter](docs/friends.md)
