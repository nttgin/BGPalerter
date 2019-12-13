# Uptime monitoring

Since version 1.22.0 it is possible to monitor the status of the BGPalerter process.

There are various approaches for monitoring the status of BGPalerter, each implemented in a specific module. 
You can declare the modules you want to load/enable in `config.yml`, as follows:

```yaml
uptimeMonitors:
  - file: uptimeApi
    params:
      useStatusCodes: true
      host: null
      port: 8011

  - file: uptimeHealthcheck
    params:
      url: url_to_poll
      intervalSeconds: 300
      method: get
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
uptimeMonitors:

  - file: uptimeApi
    params:
      useStatusCodes: true
      host: null
      port: 8011
```

When the uptimeApi block is commented/deleted from the config file, no extra dependencies are loaded and no open port is required. 

The API, in addition to the JSON answer, can use HTTP status codes for an easier integration with Nagios and similar.

Parameters for this module are:

|Parameter| Description| 
|---|---|
|useStatusCodes| A boolean that if set to true enables HTTP status codes in the response. Nothing changes in the JSON output provided by the API. | 
|host| The IP address on which the API will be reachable. If `null` or missing, the API will be reachable on all the addresses of the machine.| 
|port| The port on which the API will be reachable. | 


## uptimeHealthcheck

The uptimeHealthcheck module is a component that will start polling a provided URL at a regular interval.

This can be used to send a heartbeat signal to a monitoring system (e.g. https://healthchecks.io/).
If there is any warning about any component activated in BGPalerter, the heartbeat will not be issued (independently from the fact that the process is still running).


In `config.yml` the uptimeHealthcheck is declared as:

```yaml
uptimeMonitors:

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







