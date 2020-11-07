#!/bin/bash

apt-get install tar
apt-get install wget
rm kafka_2.13-2.6.0.tgz*
wget https://mirror.lyrahosting.com/apache/kafka/2.6.0/kafka_2.13-2.6.0.tgz
tar -xzf kafka_2.13-2.6.0.tgz

nohup ./kafka_2.13-2.6.0/bin/zookeeper-server-start.sh ./kafka_2.13-2.6.0/config/zookeeper.properties &
nohup ./kafka_2.13-2.6.0/bin/kafka-server-start.sh ./kafka_2.13-2.6.0/config/server.properties &
nohup ./kafka_2.13-2.6.0/bin/kafka-topics.sh --create --topic bgpalerter --bootstrap-server 0.0.0.0:9092 &