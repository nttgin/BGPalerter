# Uptime monitoring

Since version 1.22.0 it is possible to monitor the status of the BGPalerter process through an API.

The API is reachable at `http://localhost:8011/status` and provides a summary of the status of various components of BGPalerter. If any of the components is having a problem, the attribute `warning` is set to true.

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

When the API is disabled (default), no extra dependencies are loaded and no open port is required. 

The API, in addition to the JSON answer, can use HTTP status codes for an easier integration with Nagios and similar.
Please, see [configuration](configuration.md) for all the possible configuration parameters.

