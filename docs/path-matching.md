# Path matching

The component `monitorPath` allows to specify rules in order to get notified when specific conditions are matched on AS_PATHs.

The rules must be expressed with regular expressions (if you need to refresh your skills or test a regular expression, we suggest [this](https://regex101.com/)).
The AS_PATH parsed by BGPalerter are in the form `137,3333,1335,2914`.

> Example: 
> The prefixes list of BGPalerter has an entry such as:
> ```yaml
> 165.254.255.0/24:
>    asn: 15562
>    description: an example on path matching
>    ignoreMorespecifics: false
>  path:
>    - match: ".*2194,1234$"
>      notMatch: ".*5054.*"
>      matchDescription: detected scrubbing center
>    - match: ".*123$"
>      notMatch: ".*5056.*"
>      matchDescription: other match
> ```

Each item in the path list is a matching rule.
Each matching rule in the path list is composed of:
* match, the regular expression that will be tested on each AS path. If the expression tests positive, the BGP message triggers an alert. ASns are comma separated (see example above).
* notMatch, the regular expression that will be tested on each AS path. If the expression tests positive, the BGP message will not triggers an alert. ASns are comma separated (see example above).
* matchDescription, the description that will be reported in the alert in case the regex test results in a match.
* maxLength, the maximum length allowed for an AS path. Longer paths will trigger an alert.
* minLength, the minimum length allowed for an AS path. Shorter paths will trigger an alert.

> Remember, the various matching rules are in OR among each other, while the fields inside a single matching rule are in AND.  
> This means that in the example above, the user will receive an alert if (".*2194,1234$" AND NOT ".*5054.*") OR (".*123$" AND NOT ".*5056.*") 

## Some common examples

* `(,|^)789$` - match paths that originate with AS789, no matter what they have in front (including nothing in front);
* `(,|^)456,` - match any path that traverses AS456 at any point, except origin;
* `(,|^)456(,|$)` - match any path that traverses AS456 at any point (including as origin, or as last AS);
* `^123,456,` - match paths where the last traversed ASns were 123 and 456 (in that order);
* `^123,456,789$` - match the exact path [123, 457, 789];
* `\[789,101112\]` - match paths containing the AS_SET {789, 101112}.


### Match regular expression with multiple conditions in AND

If you want to specify multiple conditions in the same match parameter, you can use the positive lookahead construct offered natively by regular expressions.
A positive lookahead is in the form `(?=exp1)(?=exp2)` where `exp1` and `exp2` are regular expressions
Positive lookaheads work also for negative conditions (e.g. `(?!exp)`), but in most of the cases this is redundant with the `notMatch` parameter.

It is important to notice that often positive lookaheads can be replaced by multiple matching rules.  





