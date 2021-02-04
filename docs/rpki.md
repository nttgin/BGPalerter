# RPKI configuration

The RPKI validation performed by BGPalerter can be configured in `config.yml` in the `rpki` section.

```yaml
rpki:
  vrpProvider: ntt
  preCacheROAs: true,
  refreshVrpListMinutes: 15
```

This configuration will be used across the entire process (e.g., by `monitorRPKI`, `monitorHijack`, `monitorROAs`).

Below you can see the parameters available:

|Parameter| Description| 
|---|---|
|preCacheROAs| When this parameter is set to true (default), BGPalerter will download Validated ROA Payloads (VRPs) lists locally instead of using online validation. More info [here](https://github.com/massimocandela/rpki-validator).|
|refreshVrpListMinutes| If `preCacheROAs` is set to true, this parameter allows to specify a refresh time for the VRPs lists (it has to be > 15 minutes) |
|vrpProvider| A string indicating the provider of the VRPs list. Possible options are: `ntt` (default), `cloudflare`, `rpkiclient`, `ripe`, `external`. Use external only if you wish to specify a file with `vrpFile`. More info [here](https://github.com/massimocandela/rpki-validator#options).|
|vrpFile| A JSON file with an array of VRPs. See example below.|
|markDataAsStaleAfterMinutes| The amount of minutes (integer) after which an unchanged VRP list is marked as stale. Set to 0 to disable the check. |


## Generating a VRP file
Using external VRP providers for the monitoring is quick and easy, but you are essentially trusting somebody else writing the VRP file correctly.

You can generate your JSON VRP file periodically and BGPalerter will load it automatically.

VRPs file example:
```json5
[
    {
        "prefix": "123.4.5.0/22",
        "asn": "1234",
        "maxLength": 24
    },
    {
        "prefix": "321.4.5.0/22",
        "asn": "9876",
        "maxLength": 22
    }
]
```

You can use any of the RPKI validator that support JSON as output format. Below some copy-paste examples.


### rpki-client

* Download rpki-client [here](https://www.rpki-client.org/);

* Create a cron job every 15 minutes with the following
    * `rpki-client -j test/`

* Set the `vrpFile` parameter in `config.yml`
    ```yaml
    rpki:
      vrpFile: test/export.json
      preCacheROAs: true
    ```
    
    
    
> Please, help with other examples    