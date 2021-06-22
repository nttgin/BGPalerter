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
|refreshVrpListMinutes| If `preCacheROAs` is set to true, this parameter allows to specify a refresh time for the VRPs lists (read [here](https://github.com/massimocandela/rpki-validator#rpki-auto-refresh-limits) for the minimum refresh time allowed). |
|vrpProvider| A string indicating the provider of the VRPs list. Possible options are: `ntt` (default), `cloudflare`, `rpkiclient`, `ripe`, `external`, `api`. The `external` and `api` options are used to specify your own VRP source, read here.|
|vrpFile| A JSON file with an array of VRPs. See example below.|
|markDataAsStaleAfterMinutes| The amount of minutes (integer) after which an unchanged VRP list is marked as stale. Set to 0 to disable the check. |


## Use your own VRPs
Using external VRP providers for the monitoring is quick and easy, but you are essentially trusting somebody else writing the VRP file correctly. 

Instead, you can specify your own VRPs in two ways:

* Using your own API producing JSON output;
* Using your favourite rpki validator to generate a file locally.

> In case the download of the VRP data fails, an online provider is used (the error is reported in the logs).

### Use your own API
To use your own API you need to set the following options in config.yml:

```yaml
rpki:
  vrpProvider: api
  url: https://my-api.api.com/vrps/
  preCacheROAs: true
```

> Remember, you must specify the url when you use "api" as vrpProvider

The API must return the JSON format described [here](https://github.com/massimocandela/rpki-validator#vrps-on-custom-api);

### Use your own VRP file

You can generate your JSON VRP file periodically and BGPalerter will detect changes and reload it automatically.
To do so, you have to use the following options in config.yml:

```yaml
rpki:
  vrpProvider: external
  vrpFile: myfile.json
  preCacheROAs: true
```

> Remember, you must specify vrpFile when you use "external" as vrpProvider


The VRPs file must be in the following format:
```json5
[
  {
    "prefix": "123.4.5.0/22",
    "asn": 1234,
    "maxLength": 24
  },
  {
    "prefix": "321.4.5.0/22",
    "asn": 9876,
    "maxLength": 22
  }
]
```

Also the following format is supported:
```json5
{
  roas: [ ... ] // containing items as described above
}
```

You can use any of the RPKI validator that support JSON as output format to generate it. Below some copy-paste examples.


#### rpki-client

* Download rpki-client [here](https://www.rpki-client.org/);

* Create a cron job every 15 minutes with the following
  * `rpki-client -j test/`

* Set the `vrpFile` parameter in `config.yml`
    ```yaml
    rpki:
      vrpFile: test/export.json
      preCacheROAs: true
    ```

#### Routinator

* Download Routinator [here](https://github.com/NLnetLabs/routinator)

* Run the Routinator [daemon](https://rpki.readthedocs.io/en/latest/routinator/daemon.html) with the HTTP service
  * `routinator server --http 127.0.0.1:8323`

* Set the `vrpProvider` parameter in `config.yml`
    ```yaml
    vrpProvider: api
    url: http://127.0.0.1:8323/json
    preCacheROAs: true
    ```
    
> Please, help with other examples    


### Staging/testing ROAs
You can use BGPalerter to test ROAs before deploying them for real.

How:
- enable [connectorRISDump](configuration.md#connectorrisdump) (optional but useful);
- add the "ROA" in the VRP file using the JSON format described above;
- be sure there is a prefix rule in config.yml covering the prefix of the ROA;
- leave BGPalerter on for some time.

You will get notified if your new staged roa conflicts with what announced at the BGP level.
If you are starting BGPalerter after you already created the VRP file, by enabling connectorRISDump you would be able to get an immediate feedback based on a BGP dump. In any case, new BGP updates are going to be processed in real-time and compared with the VRP file provided.

