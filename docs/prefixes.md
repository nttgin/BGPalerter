# <a name="prefixes"></a>Monitored Prefixes List

## <a name="generate"></a>Auto-generate prefixes list

To auto generate the monitored prefixes file (by default called `prefixes.yml`) execute:
* If you are using the binary `./bgpalerter-linux-x64 generate -a ASN(S) -o OUTPUT_FILE` (e.g. `./bgpalerter-linux-x64 generate -a 2914 -o prefixes.yml`).
* If you are using the source code `npm run generate-prefixes -- --a ASN(S) --o OUTPUT_FILE` (e.g. `npm run generate-prefixes -- --a 2914 --o prefixes.yml`).

The script will detect whatever is currently announced by the provided AS and will take this as "the expected status".

A warning will be triggered in case of not valid RPKI prefixes, anyway, you should always check the generated list, especially if you are using the option `-i` 

Below the list of possible parameters. **Remember to prepend them with a `--` instead of `-` if you are using the source code version.**

| Parameter | Description  | Expected format | Example  |  Required |
|---|---|---|---|---|
| -a  | The AS number(s) you want to generate the list for  | A comma-separated list of integers  | 2914,3333  | Yes |
| -o  | The YAML output file | A string ending in ".yml" | prefixes.yml | Yes
| -e  | Prefixes to exclude from the list | A comma-separated list of prefixes | 165.254.255.0/24,192.147.168.0/24 | No |
| -i  | Avoid monitoring delegated prefixes. If a more specific prefix is found and it results announced by an AS different from the one declared in -a, then set `ignore: true` and `ignoreMorespecifics: true` | Nothing | | No


## <a name="prefixes-fields"></a>Prefixes list fields

The prefix list is a file containing a series of blocks like the one below, one for each prefix to monitor.

```
165.254.255.0/24:
  description: Rome peering
  asn: 2914
  ignoreMorespecifics: false
  ignore: false,
  excludeMonitors:
    - withdrawal-detection
  path:
    match: ".*2194,1234$"
    notMatch: ".*5054.*"
    matchDescription: detected scrubbing center
    maxLength: 128
    minLength: 2
    
```

> Tip: In yml, arrays of values are described with dashes, like below:
```
asn:
- 2914
- 3333 
```

Below the complete list of attributes:

| Attribute | Description | Expected type | Required |
|---|---|---|---|
| asn | The expected origin AS(es) of the prefix | An integer or an array of integers. | Yes | 
| description | A description that will be reported in the alerts | A string | Yes |
| ignoreMorespecifics | Prefixes more specific of the current one will be excluded from monitoring | A boolean | Yes |
| ignore | Exclude the current prefix from monitoring. Useful when you are monitoring a prefix and you want to exclude a particular sub-prefix| A boolean | No |
| includeMonitors | The list of monitors you want to run on this prefix. If this attribute is not declared, all monitors will be used. Not compatible with excludeMonitors. | An array of strings (monitors name according to config.yml) | No |
| excludeMonitors | The list of monitors you want to exclude on this prefix. Not compatible with includeMonitors. | An array of strings (monitors name according to config.yml) | No |
| path | A dictionary containing all sub-attributes for path matching. All the sub-attributes are in AND.| Sub-attributes (as follows) | No |
| path.match | The regular expression that will be tested on each AS path. If the expression tests positive the BGP message triggers an alert. ASns are comma separated (see example above). | A string (valid RegEx) | No |
| path.notMatch | The regular expression that will be tested on each AS path. If the expression tests positive the BGP message will not triggers an alert. ASns are comma separated (see example above). | A string (valid RegEx) | No |
| path.matchDescription | The description that will be reported in the alert in case the regex test results in a match. | A string | No |
| path.maxLength | The maximum length allowed for an AS path. Longer paths will trigger an alert. | A number | No |
| path.minLength | The minimum length allowed for an AS path. Shorter paths will trigger an alert. | A number | No |


 

