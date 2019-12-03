# Uptime Monitor

The Uptime Monitor is a feature that allows to monitor the status of BGPalerter.
The API is reachable at `http://localhost:8011/status`. 
The API, in addition to the JSON answer, can use HTTP status codes for an easier integration with Nagios and similar.

When this feature is disabled, no extra dependencies are loaded and no open port is required. 
Please, see [configuration](configuration.md) for all the possible configuration parameters.

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