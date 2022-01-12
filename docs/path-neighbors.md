# Upstream and downstream AS monitoring

The component `monitorPathNeighbors` allows monitoring for unexpected neighbor ASes in AS paths. The list of neighbors can be specified in `prefixes.yml` inside the `monitorASns` sections.

> For example, imagine AS100 has two upstreams, AS99 and AS98, and one downstream, AS101. You can express the following rule in 'prefixes.yml'
> 
> ```yaml
> options:
>  monitorASns:
>    100:
>      group: noc
>      upstreams:
>        - 99
>        - 98
>      downstreams:
>        - 101
> ```

Every time an AS path is detected with a different upstream/downstream AS, an alert will be generated.

**You can generate the upstream/downstream lists automatically. Refer to the options `-u` and `-n` of the [auto configuration](prefixes.md#generate).**

According to the above configuration, 
* the AS path [10, 20, 30, 100, 101] will generate an alert since AS30 is not an upstream of AS100;
* the AS path [10, 20, 30, 100] will generate an alert since AS30 is not an upstream of AS100;
* the AS path [10, 20, 99, 100, 101] will not generate an alert since AS99 is an upstream of AS100 and AS101 is a downstream of of AS100;
* the AS path [10, 20, 99, 100, 104] will generate an alert since AS104 is not a downstream of AS100;
* the AS path [100, 104] will generate an alert since AS104 is not a downstream of AS100.

You can disable the monitoring by removing the upstreams and downstreams lists or by removing the `monitorPathNeighbors` block in `config.yml`.

If you delete only one of the upstreams and downstreams lists, the monitoring will continue on the remaining one.

> E.g., the config below monitors only for upstreams
>
> ```yaml
> options:
>  monitorASns:
>    100:
>      group: noc
>      upstreams:
>        - 99
>        - 98
> ```

Example of alert:
> A new upstream of AS100 has been detected: AS30


If you provide empty lists, the monitoring will be performed and you will receive an alert for every upstream/downstream.

> E.g., the config below monitors only for downstreams and expects to never see any downstream AS (stub network)
>
> ```yaml
> options:
>  monitorASns:
>    100:
>      group: noc
>      downstreams:
> ```



Parameters for this monitor module:

|Parameter| Description| 
|---|---|
|thresholdMinPeers| Minimum number of peers that need to see the BGP update before to trigger an alert. |
|maxDataSamples| Maximum number of collected BGP messages for each alert which doesn't reach yet the `thresholdMinPeers`. Default to 1000. As soon as the `thresholdMinPeers` is reached, the collected BGP messages are flushed, independently from the value of `maxDataSamples`.|
