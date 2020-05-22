npm install -g anyproxy
nohup anyproxy --port 8001 &
./node_modules/.bin/mocha --exit tests/proxy_tests/*.js --require @babel/register