#!/usr/bin/env bash
apt-get update
apt-get install -y curl sudo build-essential vim openssh-client npm gcc g++ make nodejs
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
