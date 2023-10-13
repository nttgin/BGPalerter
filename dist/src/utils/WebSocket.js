"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _ws2 = _interopRequireDefault(require("ws"));
var _pubSub = _interopRequireDefault(require("../utils/pubSub"));
var _brembo = _interopRequireDefault(require("brembo"));
var _uuid = require("uuid");
var _nodeCleanup = _interopRequireDefault(require("node-cleanup"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var WebSocket = exports["default"] = /*#__PURE__*/_createClass(function WebSocket(host, options) {
  var _this = this;
  _classCallCheck(this, WebSocket);
  _defineProperty(this, "_ping", function () {
    if (_this.ws) {
      try {
        _this.ws.ping();
      } catch (e) {
        // Nothing to do
      }
    }
  });
  _defineProperty(this, "_pingReceived", function () {
    _this.lastPingReceived = new Date().getTime();
  });
  _defineProperty(this, "_pingCheck", function () {
    var nPings = 6;
    if (_this.ws) {
      _this._ping();
      if (_this.lastPingReceived + _this.pingInterval * nPings < new Date().getTime()) {
        _this._publishError("The WebSocket client didn't receive ".concat(nPings, " pings. Disconnecting."));
        _this.disconnect();
        _this.connect();
      }
    }
  });
  _defineProperty(this, "_startPing", function () {
    if (_this.pingIntervalTimer) {
      clearInterval(_this.pingIntervalTimer);
    }
    _this._pingReceived(); // Set initial ping timestamp
    _this.pingIntervalTimer = setInterval(function () {
      _this._pingCheck();
    }, _this.pingInterval);
  });
  _defineProperty(this, "_connect", function () {
    _this.connectionId = (0, _uuid.v4)();
    var url = _brembo["default"].build(_this.host.split("?")[0], {
      params: _objectSpread(_objectSpread({}, _brembo["default"].parse(_this.host).params), {}, {
        connection: _this.connectionId
      })
    });
    _this.ws = new _ws2["default"](url, _this.options);
    _this.setOpenTimeout(true);
    _this.ws.on('message', function (data) {
      _this._pingReceived();
      _this.pubsub.publish("message", data);
    });
    _this.ws.on('close', function (data) {
      _this.alive = false;
      _this.setOpenTimeout(false);
      _this.pubsub.publish("close", data);
    });
    _this.ws.on('pong', _this._pingReceived);
    _this.ws.on('error', function (message) {
      _this._publishError(message);
    });
    _this.ws.on('open', function () {
      _this.alive = true;
      _this.setOpenTimeout(false);
      _this.pubsub.publish("open", {
        connection: _this.connectionId
      });
    });
    _this._startPing();
  });
  _defineProperty(this, "send", function (data) {
    return new Promise(function (resolve, reject) {
      try {
        _this.ws.send(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  _defineProperty(this, "connect", function () {
    if (_this.ws) {
      _this.disconnect();
    }
    if (_this.connectTimeout) {
      clearTimeout(_this.connectTimeout);
    }
    _this.connectTimeout = setTimeout(_this._connect, _this.connectionDelay);
    _this.connectionDelay = _this.reconnectSeconds;
  });
  _defineProperty(this, "_publishError", function (message) {
    _this.pubsub.publish("error", {
      type: "error",
      message: message,
      connection: _this.connectionId
    });
  });
  _defineProperty(this, "setOpenTimeout", function (setting) {
    if (_this.openConnectionTimeout) {
      clearTimeout(_this.openConnectionTimeout);
    }
    if (setting) {
      _this.openConnectionTimeout = setTimeout(function () {
        _this._publishError("connection timed out");
        if (_this.ws) {
          _this.disconnect();
          _this.connect();
        }
      }, _this.openConnectionTimeoutSeconds);
    }
  });
  _defineProperty(this, "disconnect", function () {
    try {
      _this.ws.removeAllListeners("message");
      _this.ws.removeAllListeners("close");
      _this.ws.removeAllListeners("error");
      _this.ws.removeAllListeners("open");
      _this.ws.removeAllListeners("pong");
      _this.ws.terminate();
      _this.ws = null;
      _this.alive = false;
      if (_this.pingIntervalTimer) {
        clearInterval(_this.pingIntervalTimer);
      }
    } catch (e) {
      // Nobody cares
    }
  });
  _defineProperty(this, "on", function (event, callback) {
    return _this.pubsub.subscribe(event, callback);
  });
  this.pubsub = new _pubSub["default"]();
  this.host = host;
  this.options = options;
  this.ws = null;
  this.alive = false;
  this.pingInterval = options.pingIntervalSeconds ? options.pingIntervalSeconds * 1000 : 40000;
  this.reconnectSeconds = options.reconnectSeconds ? options.reconnectSeconds * 1000 : 30000;
  this.connectionDelay = 8000;
  this.openConnectionTimeoutSeconds = 40000;
  this.lastPingReceived = null;
  (0, _nodeCleanup["default"])(function () {
    if (_this.ws) {
      _this.pubsub.publish("close", "process termination");
      _this.disconnect();
    }
  });
});