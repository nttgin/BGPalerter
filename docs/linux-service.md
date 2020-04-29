## Run BGPalerter as a Linux Service
If you are interested in running this application as a service on a Linux server here is a basic guide covering how to do that.  This process works for RHEL 7 based Linux installations.  It will likely work very similiarly on other systemctl enabled installations.

### Create directory for the application to reside
Create a directory to place the application files.

`mkdir /opt/bgpalerter`

If this is a new installation `cd /opt/bgpalerter` before downloading your files and running them for the first time.  If this is an existing install simply move the files of your existing install into this directory `mv -t /opt/bgpalerter bgpalerter-linux-x64 bgpalerter.pid config.yml prefixes.yml`

This is the directory where the binary and yaml config files will be stored.  The application will also create `logs` and `src` subdirectories here if needed.  You do not have to use `/opt/bgpalerter` as your directory of choice, if you choose something else - simply make sure whatever you choose gets updated in the systemd service file below as well.

### Create systemd service file
Next you need to create the systemd service file.

`vi /etc/systemd/system/bgpalerter.service`

The contents of this file should be as follows:

```
[Unit]
Description=BGPalerter
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/bgpalerter
ExecStart=/opt/bgpalerter/bgpalerter-linux-x64

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

### Another helpful trick
Create this file.

`vi /usr/bin/bgpalerter`

The contents of this file should be as follows:

```
#!/bin/bash

for arg in "$@"
do
  if [ "$arg" == "--help" ] || [ "$arg" == "-h" ]
  then
    echo "--start    Start the Services"
    echo "--stop     Stop the Services"
    echo "--restart  Restart the Services"
  elif [ "$arg" == "--start" ]
  then
    echo "Starting BGPalerter"
    systemctl start bgpalerter.service
  elif [ "$arg" == "--stop" ]
  then
    echo "Stopping BGPalerter"
    systemctl stop bgpalerter.service
  elif [ "$arg" == "--restart" ]
  then
    echo "Restarting BGPalerter"
    systemctl restart bgpalerter.service
fi
done
```

Make that file executable.

`chmod +x /usr/bin/bgpalerter`

This file allows you to simply type the following commands if systemctl is too much work for you to remember!

`bgpalerter --help`

`bgpalerter --start`

`bgpalerter --stop`

`bgpalerter --status`
