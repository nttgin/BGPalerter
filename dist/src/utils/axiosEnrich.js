"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _md = _interopRequireDefault(require("md5"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var attempts = {};
var numAttempts = 2;

var retry = function retry(axios, error) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      var key = (0, _md["default"])(JSON.stringify(error.config));
      attempts[key] = attempts[key] || 0;
      attempts[key]++;

      if (attempts[key] <= numAttempts) {
        resolve(axios.request(error.config));
      } else {
        reject(error);
      }
    }, 2000);
  });
};

function _default(axios, httpsAgent, userAgent) {
  // Set agent/proxy
  if (httpsAgent) {
    axios.defaults.httpsAgent = httpsAgent;
  }

  if (userAgent) {
    axios.defaults.headers.common = {
      "User-Agent": userAgent
    };
  } // Retry


  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if (error.config) {
      return retry(axios, error);
    }

    return Promise.reject(error);
  });
  return axios;
}