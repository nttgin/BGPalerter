# Process monitoring

Since version 1.22.0 it is possible to monitor the status of the BGPalerter process.

There are various approaches for monitoring the status of BGPalerter, each implemented in a specific module. 
You can declare the modules you want to load/enable in `config.yml`, as follows:

```yaml
processMonitors:
  - file: uptimeApi
    params:
      useStatusCodes: true
  - file: uptimeHealthcheck
    params:
      url: url_to_poll
      intervalSeconds: 300
      method: get

  - file: sentryModule
    params:
      dsn: https://<key>@sentry.io/<project>
```


## uptimeApi

The uptimeApi module enables an API to retrieve the current status of BGPalerter.

By default the API is reachable at `http://localhost:8011/status` and provides a summary of the status of various components of BGPalerter. If any of the components is having a problem, the attribute `warning` is set to true.

The following is an example of the API output.

```
{
    "warning": false,
    "connectors": [
            {
                "name": "ConnectorRIS",
                "connected": true
            }
        ]
}
```

In `config.yml` the uptimeApi is declared as:

```yaml
processMonitors:
  - file: uptimeApi
    params:
      useStatusCodes: true
```

When the uptimeApi block is commented/deleted from the config file, no extra dependencies are loaded and no open port is required.


The REST API uses the generic `rest` configuration in `config.yml`. Read [here](configuration.md) or see `config.yml.example` for more information.
The REST configuration is by default:
```yaml
rest:
  host: localhost
  port: 8011
```



The API, in addition to the JSON answer, can use HTTP status codes for an easier integration with Nagios and similar.

Parameters for this module are:

|Parameter| Description| 
|---|---|
|useStatusCodes| A boolean that if set to true enables HTTP status codes in the response. Nothing changes in the JSON output provided by the API. |


## uptimeHealthcheck

The uptimeHealthcheck module is a component that will start polling a provided URL at a regular interval.

This can be used to send a heartbeat signal to a monitoring system (e.g., https://healthchecks.io/).
If there is any warning about any component activated in BGPalerter, the heartbeat will not be issued (independently from the fact that the process is still running).


In `config.yml` the uptimeHealthcheck is declared as:

```yaml
processMonitors:

  - file: uptimeHealthcheck
    params:
      url: url_to_poll
      intervalSeconds: 300
      method: get
```

If the `method` parameter is set to `post`, the body of the request will contain a detailed status of BGPalerter.
The status is reported in the same JSON format described for the uptimeApi module.

Parameters for this module are:

|Parameter| Description| 
|---|---|
|url| The URL to be polled periodically. | 
|intervalSecond| The interval (in seconds) between HTTP requests. | 
|method| The method used for the HTTP request. It can be `get` or `post`. | 


## sentryModule

The sentryModule is a component that allows the monitoring of the BGPalerter process for runtime exceptions. 
Useful especially for testing new experimental modules.

To enable this feature, create a new project on your Sentry server and grab the generated DSN.

In `config.yml` the sentryModule is declared as:

```yaml
processMonitors:

  - file: sentryModule
    params:
      dsn: https://<key>@sentry.io/<project>
```

Parameters for this module are:

|Parameter| Description| 
|---|---|
|dsn| The DSN where the logs will be sent. | 
