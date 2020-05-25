## Run BGPalerter behind a proxy server
BGPalerter can be run in a production environment requiring to access external resources via an HTTP/HTTPS proxy server.
This setting can be set at the top level in `config.yml` file :

```yaml
httpProxy: http://username:password@proxy.example.org:8080
```

## Bypass proxy for specific BGPalerter modules

By default, all HTTP/HTTPS/WS requests done by BGPalerter will be proxified by the proxy server specified in your configuration. However, you may want to not proxy requests to internal apps or networks. This behavior can be overridden per module (i.e reporter/connector/monitor) by adding the `noProxy: true` parameter to the desired module(s) in `config.yml`.
For instance, the configuration below allows you to bypass your proxy server for your traffic towards Alerta instance.


```yaml
 - file: reportAlerta
   channels:
     - hijack
     - newprefix
     - visibility
     - path
     - misconfiguration
     - rpki
   params:
     noProxy: true
     severity:
       hijack: critical
       newprefix: informational
       visibility: debug
       path: trace
```