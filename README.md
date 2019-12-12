[![Build Status](https://api.travis-ci.org/nttgin/bgpalerter.svg)](https://travis-ci.org/nttgin/bgpalerter)
![Dependabot Status](https://badgen.net/dependabot/nttgin/BGPalerter/?icon=dependabot)
[![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com)
[![Known Vulnerabilities](https://snyk.io/test/github/nttgin/BGPalerter/badge.svg?targetFile=package.json)](https://snyk.io/test/github/nttgin/BGPalerter?targetFile=package.json)

# BGPalerter
Real-time BGP monitoring tool, pre-configured for visibility loss and hijacks detection.

You just run it. You don't need to provide any data source or connect it to anything in your network since it connects to public repos.

It can deliver alerts on files, by email, on slack, and more.

![BGPalerter](https://massimocandela.com/img/bgpalerter_github_image.png)

## TL;DR
> This section is useful if you don't care about the source code but you just want to run the monitor.
If you want to know more about the source code (which is completely open) please see the following sections.

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases) (be sure to select the one for your OS)

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/master/config.yml.example) as `config.yml` and [`prefixes.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/master/prefixes.yml.example) as `prefixes.yml`, and place them in the same directory of the executable (if you skip this step, some default configuration files will be generated during the first execution)

3. Modify `prefixes.yml` and add the prefixes you want to monitor (or see below how to auto generate this file)

4. Run the executable (e.g. `chmod 700 bgpalerter-linux-x64 && nohup ./bgpalerter-linux-x64 &`)

5. See the alerts in `logs/reports-YYYY-MM-DD.log` (e.g. `tail -f logs/reports*`)

In `config.yml.example` you can find other reporting mechanisms (e.g. email and slack) in addition to logging to files. 
Please uncomment the related section and configure according to your needs.


## Documentation

- [Installation](docs/installation.md)
    - [Run from binary](docs/installation.md#running-bgpalerter-from-binaries)
    - [Run from source code](docs/installation.md#running-bgpalerter-from-the-source-code)
- [Monitored prefixes list](docs/prefixes.md#prefixes)
    - [Generate prefix list](docs/prefixes.md#generate)
    - [Prefix attributes description](docs/prefixes.md#prefixes-fields)
- [Configuration](docs/configuration.md)
    - [Composition](docs/configuration.md#composition)
        - [Connectors](docs/configuration.md#connectors)
        - [Monitors](docs/configuration.md#monitors)
        - [Reports](docs/configuration.md#reports)
            - [reportFile](docs/configuration.md#reportfile)
            - [reportEmail](docs/configuration.md#reportemail)
            - [reportSlack](docs/configuration.md#reportslack)
            - [reportKafka](docs/configuration.md#reportkafka)
            - [reportSyslog](docs/configuration.md#reportsyslog)
    - [Uptime monitoring](docs/uptime-monitor.md)
- [More information for developers](docs/develop.md)
    - [All npm commands](docs/develop.md#all-npm-commands)

