const AnyProxy = require('anyproxy');
const options = {
  port: 8001,
  forceProxyHttps: false,
  wsIntercept: false,
  silent: true
};

var proxyServer = new AnyProxy.ProxyServer(options);

proxyServer.on('ready', () => { module.exports = proxyServer } );
proxyServer.start();


