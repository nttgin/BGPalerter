## Run BGPalerter as a Linux Service
If you are interested in running this application as a service on a Linux server here is a basic guide covering how to do that.  This process works for RHEL 7 based Linux installations.  It will likely work very similiarly on other systemctl enabled installations.

### Create directory for the application to reside
Create a user for BGPalerter

```shell
adduser bgpalerter
```

**If this is a new installation:**

* download the BGPalerter binary in the home of the newly created user:

    ```shell
    sudo su bgpalerter
    
    cd /home/bgpalerter
    
    wget https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-linux-x64
    
    chmod +x bgpalerter-linux-x64
    ```

* execute it and proceed with the auto-configuration, at the end of which all the needed files will be created:

    ```shell
    ./bgpalerter-linux-x64
    ```

**If this is an existing installation:**

* simply move the files of your existing installation into this directory and assign the correct permissions

    ```shell
    mv /your/old/bgpalerter /home/bgpalerter
    chown -R bgpalerter:bgpalerter /home/bgpalerter
    chmod -x /home/bgpalerter/bgpalerter-linux-x64
    ```

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
RestartSec=30s
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
You can enable automatic updates by following the instructions below.

Enter as bgpalerter user in its home directory:

```shell
sudo su bgpalerter
cd /home/bgpalerter
```


Create a file `upgrade.sh` with the following content:

```shell
#!/usr/bin/env bash

# Change the directories if needed
DIR=/home/bgpalerter
LOGS=$DIR/logs

# If log file does not exist, create it
if [ ! -f $LOGS/upgrade.log ]; then
  touch $LOGS/upgrade.log
  chown bgpalerter:bgpalerter $LOGS/upgrade.log
fi

# Delete log file if larger than 5MB
find $LOGS -type f -name "upgrade.log" -size +5M -delete

exec 1>> $LOGS/upgrade.log 2>&1

cd $DIR

# Download the latest version and save it to a temp file
wget --no-verbose -O bgpalerter-linux-x64.tmp https://github.com/nttgin/BGPalerter/releases/latest/download/bgpalerter-linux-x64

# Set permissions to execute the file
chmod +x bgpalerter-linux-x64.tmp

# Set variables to compare versions
if [ -f bgpalerter-linux-x64 ]; then
  # If a file exists already
  v1=$(./bgpalerter-linux-x64 -v)
  v2=$(./bgpalerter-linux-x64.tmp -v)
  
else
  v1=$"0"
  v2=$(./bgpalerter-linux-x64.tmp -v)
fi

# If there is no old version
if [ "$v1" == "0" ];then
  #Remove the file
  rm bgpalerter-linux-x64.tmp

  echo "This script upgrades BGPalerter; however, $DIR/bgpalerter-linux-x64 cannot be found. Please, install it first https://github.com/nttgin/BGPalerter/blob/main/docs/linux-service.md"
  exit 1

# The versions are different
elif [ "$v1" != "$v2" ];then
  # Remove the old version
  rm bgpalerter-linux-x64

  # Rename the temp file
  mv bgpalerter-linux-x64.tmp bgpalerter-linux-x64

  # Kill the process 
  # We use kill because "systemctl restart bgpalerter" works only 
  # if you run this script as root. Systemctl will restart the process.
  kill -9 $(cat $DIR/bgpalerter.pid) || true

  echo "A new version of BGPalerter has been installed"

else
  # If the versions are the same, delete the temp file
  rm bgpalerter-linux-x64.tmp
  echo "BGPalerter is up to date"
fi
```

The `upgrade.sh` file needs to be executable

```shell
chmod +x upgrade.sh
```

Now we need to configure a cron job to periodically execute `upgrade.sh`.

As the `bgpalerter` user, do

```shell
crontab -e
```

and append the following line to perform the check weekly
```
0 0 * * 0 /home/bgpalerter/upgrade.sh
```
