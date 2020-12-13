# RIPE RIS disconnections

Sometimes among the error logs you will find RIS disconnection logs (usually error 1006).

The following causes are possible:

1) **Network issues.** The machine where BGPalerter is running loses connectivity (maybe just for a few seconds).
2) **You are monitoring something that produces too many BGP updates** (e.g., your prefixes are not stable or constantly re-announced). In such cases you may be too slow in consuming the data and the server disconnects you to flush the buffer.

Anyway, unfortunately sometimes this happens without an explanation due to RIPE RIS instabilities.
This has been reported to the RIPE RIS team. 

_Please, send an email at rislive@ripe.net for inquiries or to highlight the importance of the reliability of this service._
