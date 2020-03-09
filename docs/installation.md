# Installation

## Running BGPalerter from binaries - Quick Setup

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases) (be sure to select the one for your OS)

2. Execute the binary (e.g. `chmod 700 bgpalerter-linux-x64 && ./bgpalerter-linux-x64`)  
The first time you run it, the auto-configuration will start.

## Running BGPalerter from binaries - All steps

#### Linux

1. Download the binary:  `wget https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-linux-x64`

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/master/config.yml.example) as `config.yml` (in the same directory of the binary)

3. Make the binary executable (e.g. `chmod 700 bgpalerter-linux-x64`)

4. Auto-configure it: `./bgpalerter-linux-x64 generate -a _YOUR_ASN_ -o prefixes.yml -i -m`  

5. Run it: `./bgpalerter-linux-x64`  
Or use `nohup ./bgpalerter-linux-x64 &` to leave it running after you close the terminal

#### Mac

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-mac-x64).

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/master/config.yml.example) as `config.yml` (in the same directory of the binary)

3. Make the binary executable (e.g. `chmod 700 bgpalerter-mac-x64`)

4. Auto-configure it: `./bgpalerter-mac-x64 generate -a _YOUR_ASN_ -o prefixes.yml -i -m`  

5. Run it: `./bgpalerter-mac-x64`


#### Windows

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-win-x64.exe).

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/master/config.yml.example) as `config.yml` (in the same directory of the binary)

3. Open cmd (press `ctrl + R` and type `cmd`) and go on the directory where you downloaded the binary (usually `cd C:\Users\_USER_\Downloads`)

4. Run it: `bgpalerter-win-x64.exe`

## Running BGPalerter from the source code

1. Git clone this repo.

2. Install Node.js (version >= 10.16) and npm ([installing node and npm](https://nodejs.org/en/download/)).

3. Execute `npm install` to install all dependencies.

4. Run `npm run watch-and-serve` to run the application. At every file change it will self-reload.


## Running BGPalerter in Docker

BGPalerter is available in Docker Hub [here](https://hub.docker.com/r/nttgin/bgpalerter/tags).

There are two main builds:
* `latest` stable version for production monitoring;
* `dev` reflects the last commit in the `dev` branch. Use this only for development purposes.

Additionally, each release has its own build in case you want to revet back to an older version.
