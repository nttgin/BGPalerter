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

The file needs to be executable
```
chmod +x upgrade.sh
chown bgpalerter:bgpalerter /home/bgpalerter/upgrade.sh
```

The contents of this file should be as follows:

```
#!/usr/bin/env bash

#If log file does not exist, create it
if [ ! -f /home/bgpalerter/logs/upgrade.log ]; then
  touch /home/bgpalerter/logs/upgrade.log
  chown bgpalerter:bgpalerter /home/bgpalerter/logs/upgrade.log
fi

#Log everything if executing manually
exec 1> /home/bgpalerter/logs/upgrade.log 2>&1
set -vex
PS4='+\t '

#Download the latest version and save it to a temp file
wget -O bgpalerter-linux-x64.tmp https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-linux-x64

#Set permissions and ownership to execute the file and capture the version
chmod +x bgpalerter-linux-x64.tmp
chown -R bgpalerter:bgpalerter /home/bgpalerter/

#Set variables to compare versions
if [ -f bgpalerter-linux-x64 ]; then
  #If a file exists already
  v1=$(./bgpalerter-linux-x64 -v)
  v2=$(./bgpalerter-linux-x64.tmp -v)

else
  #If the file does not exist - For testing purposes
  v1=$"0"
  v2=$(./bgpalerter-linux-x64.tmp -v)
fi

#If the versions are not the same
if [ "$v1" == "0" ];then
  #Rename the temp file
  mv bgpalerter-linux-x64.tmp bgpalerter-linux-x64

  #Restart the service
  systemctl restart bgpalerter

  #Pause for one second for service to fully start
  sleep 1

elif [ "$v1" != "$v2" ];then
  #Rename the old binary and append the version
  mv bgpalerter-linux-x64 "bgpalerter-linux-x64-$v1"

  #Rename the temp file
  mv bgpalerter-linux-x64.tmp bgpalerter-linux-x64

  #Restart the service
  systemctl restart bgpalerter
  
  #Pause for one second for service to fully start
  sleep 1

else
  #If the versions are the same - delete the temp file
  rm bgpalerter-linux-x64.tmp
fi

#Log service status
systemctl status bgpalerter -l

#Delete renamed binaries older than 60 days
find -type f -name 'bgpalerter-linux-x64-*' -mtime +60 -delete

#Delete log file if larger than 5MB
find /home/bgpalerter/logs/ -type f -name "upgrade.log" -size +5M -delete
```

Configure a cron job to run, in this case, weekly as root.

`crontab -e`

The contents of this file should be as follows:
```
0 0 * * 0 /home/bgpalerter/upgrade.sh
```
