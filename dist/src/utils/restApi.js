"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _restify = _interopRequireDefault(require("restify"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var RestApi = exports["default"] = /*#__PURE__*/_createClass(function RestApi(params) {
  var _this = this;
  _classCallCheck(this, RestApi);
  _defineProperty(this, "_startServer", function () {
    if (!_this._serverPromise) {
      _this._serverPromise = new Promise(function (resolve, reject) {
        try {
          if (_this.host && _this.port) {
            _this.server = _restify["default"].createServer();
            _this.server.pre(_restify["default"].pre.sanitizePath());
            _this.server.listen(_this.port, _this.host);
            _this.enabled = true;
            resolve();
          } else if (_this.port) {
            _this.server = _restify["default"].createServer();
            _this.server.pre(_restify["default"].pre.sanitizePath());
            _this.server.listen(_this.port);
            _this.enabled = true;
            resolve();
          } else {
            _this.enabled = false;
            reject("The port parameter must be specified to start the REST API.");
          }
        } catch (error) {
          _this.enabled = false;
          reject(error);
        }
      });
    }
    return _this._serverPromise;
  });
  _defineProperty(this, "addUrl", function (url, callback) {
    if (_this.urls[url]) {
      return Promise.reject("The URL for the REST API already exists and cannot be replaced");
    } else {
      _this.urls[url] = callback;
      return _this._startServer().then(function () {
        _this.server.get(url, _this.urls[url]);
      });
    }
  });
  this.params = params;
  this.port = this.params.port || 8011;
  this.host = this.params.host || null;
  this.enabled = false;
  this.urls = {};
  this._serverPromise = null;
  if (!!RestApi._instance) {
    return RestApi._instance;
  }
  RestApi._instance = this;
});
_defineProperty(RestApi, "_instance", void 0);