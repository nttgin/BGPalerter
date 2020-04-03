#!/usr/bin/env bash
apt-get update
apt-get install -y curl sudo build-essential vim openssh-client npm gcc g++ make nodejs
curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
