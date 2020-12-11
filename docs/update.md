# Updating BGPalerter

BGPalerter can be easily updated. The configuration of BGPalerter is persisted in `config.yml` and `prefixes.yml`, as long as you preserve such files you will not need to reconfigure it after the update.

* If you are using the binary, go in the [releases tab](https://github.com/nttgin/BGPalerter/releases), download the new binary and replace the old one.
* If you are using the source code, simply do a git pull of the master branch. After, do `npm install` to update the dependencies.
* If you are using docker, do `docker pull nttgin/bgpalerter:latest`, after stop and remove your current container and [run it again](installation.md#running-bgpalerter-in-docker).
* You can set [automatic updates](linux-service.md#automatic-updates).