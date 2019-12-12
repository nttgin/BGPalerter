# Installation


## Running BGPalerter from binaries

1. Download the binary [here](https://github.com/nttgin/BGPalerter/releases) (be sure to select the one for your OS).

2. Download [`config.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/master/config.yml.example) as `config.yml` and [`prefixes.yml.example`](https://raw.githubusercontent.com/nttgin/BGPalerter/master/prefixes.yml.example) as `prefixes.yml`, and place them in the same directory of the executable (if you skip this step, some default configuration files will be generated during the first execution).

3. Modify `prefixes.yml` and add the prefixes you want to monitor (or see below how to auto generate this file).

4. Run the executable (e.g. `chmod 700 bgpalerter-linux-x64 && nohup ./bgpalerter-linux-x64 &`).

5. See the alerts in `logs/reports-YYYY-MM-DD.log` (e.g. `tail -f logs/reports*`)

In `config.yml.example` you can find other reporting mechanisms (e.g. email and slack) in addition to logging to files. 
Please uncomment the related section and configure according to your needs.

If you enable email reporting, download also the directory `reports/email_templates` in the same directory of the executable.


## Running BGPalerter from the source code


1. Git clone this repo.

2. Install Node.js (version >= 10.16) and npm ([installing node and npm](https://nodejs.org/en/download/)).

3. Execute `npm install` to install all dependencies.

4. Run `npm run watch-and-serve` to run the application. At every file change it will self-reload.
