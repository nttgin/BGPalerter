#!/bin/bash

# Install anyproxy 
npm install -g anyproxy
# Run anyproxy in background and store its PID
nohup anyproxy --port 8001 &
ANYPROXY_PID=$!
# Run tests suite
./node_modules/.bin/mocha --exit tests/proxy_tests/*.js --require @babel/register
# Terminate anyproxy process
kill $ANYPROXY_PID
exit 0