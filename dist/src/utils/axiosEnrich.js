"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;
var _md = _interopRequireDefault(require("md5"));
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var attempts = {};
var numAttempts = 2;
var retry = function retry(axios, error, params) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      var key = (0, _md["default"])(JSON.stringify(params));
      attempts[key] = attempts[key] || 0;
      attempts[key]++;
      if (attempts[key] <= numAttempts) {
        resolve(axios.request(params));
      } else {
        reject(error);
      }
    }, 2000);
  });
};
function _default(axios, httpsAgent, userAgent) {
  var _axios$defaults, _axios$defaults2, _axios$defaults2$head, _axios$defaults$heade, _axios$defaults$heade2;
  (_axios$defaults = axios.defaults) !== null && _axios$defaults !== void 0 ? _axios$defaults : axios.defaults = {
    fetch: _nodeFetch["default"]
  };
  (_axios$defaults2$head = (_axios$defaults2 = axios.defaults).headers) !== null && _axios$defaults2$head !== void 0 ? _axios$defaults2$head : _axios$defaults2.headers = {};
  (_axios$defaults$heade2 = (_axios$defaults$heade = axios.defaults.headers).common) !== null && _axios$defaults$heade2 !== void 0 ? _axios$defaults$heade2 : _axios$defaults$heade.common = {};

  // Set agent/proxy
  if (httpsAgent) {
    axios.defaults.httpsAgent = httpsAgent;
  }
  if (userAgent) {
    axios.defaults.headers.common = {
      "User-Agent": userAgent
    };
  }
  axios.defaults.headers.common = _objectSpread(_objectSpread({}, axios.defaults.headers.common), {}, {
    'Accept-Encoding': 'gzip'
  });
  return function (params) {
    return axios(params)["catch"](function (error) {
      return retry(axios, error, params);
    });
  };
}