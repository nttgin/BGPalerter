## Run BGPalerter as a Linux Service
If you are interested in running this application as a service on a Linux server here is a basic guide covering how to do that.  This process works for RHEL 7 based Linux installations.  It will likely work very similiarly on other systemctl enabled installations.

### Create directory for the application to reside
Create a user for BGPalerter

```bash
adduser bgpalerter
sudo su bgpalerter
```

If this is a new installation, download the BGPalerter binary in the home of the newly created user and execute it:

```
cd /home/bgpalerter
wget https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-linux-x64
chmod +x bgpalerter-linux-x64
./bgpalerter-linux-x64
```
The auto-configuration will start at the end of which all the needed files will be created.

If this is an existing install simply move the files of your existing install into this directory `mv -t /home/bgpalerter bgpalerter-linux-x64 bgpalerter.pid config.yml prefixes.yml`

The application will also create `logs` and `src` subdirectories here if needed. 

### Create systemd service file
Next you need to create the systemd service file.

`sudo vi /etc/systemd/system/bgpalerter.service`

The contents of this file should be as follows:

```
[Unit]
Description=BGPalerter
After=network.target

[Service]
Type=simple
Restart=on-failure
User=bgpalerter
WorkingDirectory=/home/bgpalerter
ExecStart=/home/bgpalerter/bgpalerter-linux-x64

[Install]
WantedBy=multi-user.target
```

### Reload systemd
Reload systemd to register the new configuration.

`systemctl daemon-reload`

### Enable and start the service
Enable BGPalerter to start at boot and then start the service.

`systemctl enable bgpalerter`

`systemctl start bgpalerter`


### Automatic Updates
Enable automatic updates.

`cd /home/bgpalerter`

`vi upgrade.sh`

The contents of this file should be as follows:
```
#!/bin/bash

#Set the DATE variable
DATE=$(date +"%m-%d-%Y")

#If the file exists - rename it and append DATE
if [ -f bgpalerter-linux-x64 ]; then
  mv bgpalerter-linux-x64 "bgpalerter-linux-x64-$DATE"
fi

#Download the latest binary
wget https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-linux-x64

#Set permissions
chmod +x bgpalerter-linux-x64
chown -R bgpalerter:bgpalerter /home/bgpalerter/*

#Restart the service
systemctl restart bgpalerter

#Delete binaries older than 60 days
find -type f -name 'bgpalerter-linux-x64-*' -mtime +60 -delete
```

Configure a cron job to run, in this case, weekly.

`crontab -e`

The contents of this file should be as follows:
```
0 0 * * 0 ./home/bgpalerter/bgpalerter/upgrade.sh
```
