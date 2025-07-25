# BGPalerter for researchers

> This is a draft, this tutorial will improve soon

BGPalerter has been designed in order to be suitable also for research activities.
While for production purposes it's usually enough to monitor specific prefixes, for research purposes you might need to monitor the entire address space. 
In particular, BGPalerter is designed to be able to handle many more BGP messages than the current RIS live streaming produces in total, with a small CPU and memory footprint.

This tutorial will briefly explain how to use BGPalerter for research.

## Environment: research

In `config.yml` you can set the parameter `environment` to the value `research`. 
This will disable some of the rules enforced for production monitoring.

If during your analysis you will find a warning of messages dropped in the logs, you may want to:

1) Check your code to verify if something is taking too much time for the processing of a single BGP message
2) Set a higher value for `maxMessagesPerSecond` (depending on the CPU resources available). Something like 10000 is a good start.
3) Set `multiProcess` to true, in order to use two processes (this is rarely required).

If the memory consumption during your analysis increases drastically, you may want to:
1) Check your code for memory leaks
2) Check you are not doing many async calls accumulating in the stack E.g., if you monitor the entire v6 address space, like on the example above, you cannot do a single network call for each BGP message received. You can instead bundle together multiple calls or implement a better `filter` function.
3) Check that the `squashAlerts` of your monitor component is working as expected. In particular, if the squashAlerts methods returns null it means the bucket of BGP messages is not yet ready to be squashed, hence it will remain in memory. See below for more information.
4) Reduce the `fadeOffSeconds`. This will drop all the BGP messages that took too long to be squashed by `squashAlerts`.


## Implementing a monitor

The analysis of the BGP messages happens in the monitor components.
So in 99% of the cases you need to create a monitor and leave as is the rest of the pipeline.
You can start by copying one of the available monitors and adapting it for your needs.  

Below an example of monitor component with comments in the code.

```javascript
import Monitor from "./monitor";

export default class myMonitor extends Monitor { // It MUST extend Monitor

    constructor(name, channel, params, env){
        super(name, channel, params, env);
        this.count = 0; // You can set here your instance variables
    };

    updateMonitoredResources = () => {
        /* This function allows you to set what you are going to
         * monitor and update the set every time the input changes */
        this.monitored = this.input.getMonitoredMoreSpecifics();
    };

    filter = (message) => {
        /* Pre-filtering. This filtering is blocking since it happens synchronously.
         * Make this filtering as tight as possible without involving external resources
         * (e.g., do NOT do database or API calls here). For example base your filtering
         * on the properties of the BGP message received */
        return message.type === 'announcement';
    };

    squashAlerts = (alerts) => {
        /* The input 'alerts' is an array of alerts with the same signature generated by the monitor method.
         * Alerts with the same signature are usually referring to the same issue (maybe as seen by different peers).
         * The expected output is a string. Here you can define what is the summary for the entire "chunk" of alerts.
         * If you return null, the alerts will not be sent to the report but will remain in the queue. The next
         * squash attempt is going to be when another alert with the same signature is received.
         * With this method you can collect alerts and decide when it's time to send them. */

        if (alerts.length > 5) { // Useless condition just to explain the concept (e.g., you could instead check how many different peers saw the issue before to report it)
            return "summary of the alerts";
        }

        return null;
    };

    monitor = (message) =>
        new Promise((resolve, reject) => {
            /* This method is non blocking since it happens asynchronously.
             * Here you can do database or API calls (maybe bundle multiple requests together to reduce network overhead). 
             * This is where the real analysis happens and when the alerts are generated. Place here your complex filtering/analysis. 
             * The 'filter' function described before is needed to avoid useless calls to the 'monitor' function, which is much more expensive in terms of memory. */

            const matchedRules = this.getMoreSpecificMatches(message.prefix); //The method getMoreSpecificMatches is inherited from the super class, it provides the rule in prefixes.yml that matches the current BGP message.
            
            for (let matchedRule of matchedRules) { // We matched something in prefixes.yml
                const signature = message.originAS.getId() + "-" + message.prefix; // All messages with the same origin AS and prefix will be bundled together. Read above the squash method to understand why.

                this.publishAlert(signature, // The method publishAlert is inherited from the super class.
                    message.prefix, // The monitored resource subject of the alert (it can be an AS or a prefix)
                    matchedRule, // The monitored rule that was matched (from prefixes.yml)
                    message, // The entire BGP message (needed for possible further troubleshooting or for storing it)
                    {
                        love: "pizza" // Extra information I want to annotate this alert with (this information will be shared with the squash method and all the reports)
                    });
            }

            resolve(true); // Remember to resolve the Promise when the calculation is completed!
        });
}
```

Useful for research are the following pre-made monitors:
* monitorPath - will detect specific conditions on AS paths
* monitorPassthrough - will let everything pass to the report component. This is useful if you want to use BGPalerter as a data connector and you want to pass the data to another application (e.g., you can send them to Kafka with `reportKafka` or you can create a report wit a `console.log` to pipe everything into standard output)
* monitorRPKI - will detect RPKI invalid announcements. I use this on the entire v4 and v6 address space. It can be used as an example of "complex" monitoring.