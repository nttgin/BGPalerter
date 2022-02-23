# Installation

## Running BGPalerter from binaries - Quick Setup

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases) (be sure to select the one for your OS)

2. Execute the binary (e.g., `chmod +x bgpalerter-linux-x64 && ./bgpalerter-linux-x64`)  
The first time you run it, the auto-configuration will start.

## Running BGPalerter from binaries - All steps

#### Linux

1. Download the binary:  `wget https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-linux-x64`

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/main/config.yml.example) as `config.yml` (in the same directory of the binary)

3. Make the binary executable (e.g., `chmod +x bgpalerter-linux-x64`)

4. Auto-configure it: `./bgpalerter-linux-x64 generate -a _YOUR_ASN_ -o prefixes.yml -i -m`  

5. Run it: `./bgpalerter-linux-x64`  
Or use `nohup ./bgpalerter-linux-x64 &` to leave it running after you close the terminal

Additionally, you can configure [BGPalerter to run as a Linux Serivce](linux-service.md)

#### Mac

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-macos-x64).

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/main/config.yml.example) as `config.yml` (in the same directory of the binary)

3. Make the binary executable (e.g., `chmod +x bgpalerter-macos-x64`)

4. Auto-configure it: `./bgpalerter-macos-x64 generate -a _YOUR_ASN_ -o prefixes.yml -i -m`  

5. Run it: `./bgpalerter-macos-x64`


#### Windows

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-win-x64.exe).

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/main/config.yml.example) as `config.yml` (in the same directory of the binary)

3. Open cmd (press `ctrl + R` and type `cmd`) and `cd` on the directory where you downloaded the binary (usually `cd C:\Users\_USER_\Downloads`)

4. Run it: `bgpalerter-win-x64.exe`

## Running BGPalerter from the source code

1. Git clone this repo.

2. Install Node.js (version >= 12) and npm ([installing node and npm](node.md)).

3. Execute `npm install` to install all dependencies.

4. Run `npm run serve` to run the application.


## Running BGPalerter in Docker

BGPalerter is available in Docker Hub [here](https://hub.docker.com/r/nttgin/bgpalerter/tags).

There are two main builds:
* `latest` stable version for production monitoring;
* `dev` reflects the last commit in the `dev` branch. Use this only for development purposes.

Additionally, each release has its own build in case you want to revert back to an older version.

To run the latest stable version of BGPalerter in Docker, do:

```
docker run -i --name bgpalerter \
  -v $(pwd)/volume:/opt/bgpalerter/volume \
  nttgin/bgpalerter:latest run serve -- --d /opt/bgpalerter/volume/
```

You can also use docker-compose for that:

```
version: "3.8"

services:
  bgpalerter:
    image: nttgin/bgpalerter:latest
    command: run serve -- --d /opt/bgpalerter/volume/
    container_name: bgpalerter
    volumes:
      - "$(pwd)/volume:/opt/bgpalerter/volume"
    restart: always
```

With this command, a new directory `./volume` will be created in the current position.
Such directory will contain all the persistent data that BGPalerter will generate, including configuration and alert logs.  
You can specify another directory by changing the directory before the colon in the -v flag (e.g., `-v _LOCATION_YOU_WANT_/volume:/opt/bgpalerter/volume`).

The command above runs BGPalerter in interactive mode (`-i` flag), which is necessary if you want to run the auto configuration.

You should replace the flag `-i` with the flag `-d`, when:
* You already have the configuration files `config.yml` and `prefixes.yml`, or you plan to create them by hand. Just place them into the volume directory.
* You executed BGPalerter with the `-i` flag and the volume directory and the configuration files have been already generated.

For production monitoring we suggest to monitor the uptime of BGPalerter.  
In case you want to monitor the uptime by using the `uptimeApi` ([read more](process-monitors.md)), you need to map the port in the docker configuration with the following command:

```bash
docker run -i --name bgpalerter \
  -v $(pwd)/volume:/opt/bgpalerter/volume \
  -p 8011:8011 \
  nttgin/bgpalerter:latest run serve -- --d /opt/bgpalerter/volume/
```

With docker-compose:

```
version: "3.8"

services:
  bgpalerter:
    image: nttgin/bgpalerter:latest
    command: run serve -- --d /opt/bgpalerter/volume/
    container_name: bgpalerter
    ports:
      - '8011:8011'
    volumes:
      - "$(pwd)/volume:/opt/bgpalerter/volume"
    restart: always
```

The `uptimeApi` module has to be enabled in `volume/config.yml` as described [here](process-monitors.md).
Now you can monitor `http://127.0.0.1:8011/status` (e.g., in Nagios) to check the status of the BGPalerter monitoring.
Such API may return a negative result when there is a misconfiguration or when BGPalerter failed to connect to the data repository.



Optionally, you can specify a health check in docker to auto-restart the container in case of prolonged failure.

```bash
docker run -i --name bgpalerter \
  -v $(pwd)/volume:/opt/bgpalerter/volume \
  --health-cmd='wget --quiet --tries=1 --spider http://127.0.0.1:8011/status || exit 1' \
  --health-timeout=2s \
  --health-retries=15 \
  --health-interval=60s \
  --restart unless-stopped \
  -p 8011:8011 \
  nttgin/bgpalerter:latest run serve -- --d /opt/bgpalerter/volume/
```

With docker-compose:

```
version: "3.8"

services:
  bgpalerter:
    image: nttgin/bgpalerter:latest
    command: run serve -- --d /opt/bgpalerter/volume/
    container_name: bgpalerter
    ports:
      - '8011:8011'
    volumes:
      - "$(pwd)/volume:/opt/bgpalerter/volume"
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://127.0.0.1:8011/status || exit 1"]
      interval: 60s
      timeout: 2s
      retries: 15
```

> This option does NOT replace [proper monitoring](process-monitors.md).
Just restarting the container will not assure you that the monitoring is working properly or that it will work again. You should always investigate failures and fix possible misconfiguration.

## BGPalerter parameters

The execution of BGPalerter supports some parameters 

| Parameter | Description |
|---|---|
| -v | Show version number |
| -h | Show help |
| -c | To specify the config file to load (default `./config.yml`) |
| -d | To specify a directory that will contain all the files used by BGPalerter. See [here](installation.md#volume) before modifying this.|
| -t | To test the configuration by generating fake BGP updates. This will start sending alerts on all the reports listening the `hijack` channel. |

You can also use the same parameters with npm (if you are running the source code), in the following format `npm run serve -- --h` (replace `h` with the parameter you need).

### Volume
BGPalerter writes/reads some files on disk (e.g., logs). The positions of these files is set in `config.yml`, where both absolute and relative paths can be used. However, the `volume` parameter can be used to modify this behavior and confine BGPalerter to a specific directory. This is mostly useful in two occasions: (1) when you want to create "virtual environments", e.g., you want to have a single installation of BGPalerter running multiple instances each operating confined in a different directory; or (2) when you are using docker and you want to create a persistent volume (see above).
