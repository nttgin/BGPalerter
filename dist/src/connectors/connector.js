"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _axiosEnrich = _interopRequireDefault(require("../utils/axiosEnrich"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Connector = /*#__PURE__*/_createClass(function Connector(name, params, env) {
  var _this = this;

  _classCallCheck(this, Connector);

  _defineProperty(this, "connect", function () {
    return new Promise(function (resolve, reject) {
      return reject(new Error('The method connect MUST be implemented'));
    });
  });

  _defineProperty(this, "_error", function (error) {
    if (_this.errorCallback) _this.errorCallback(error);
  });

  _defineProperty(this, "subscribe", function (input) {
    throw new Error('The method subscribe MUST be implemented');
  });

  _defineProperty(this, "_disconnect", function (message) {
    _this.connected = false;
    if (_this.disconnectCallback) _this.disconnectCallback(message);
  });

  _defineProperty(this, "_message", function (message) {
    if (_this.messageCallback) _this.messageCallback(message);
  });

  _defineProperty(this, "_connect", function (message) {
    _this.connected = true;
    if (_this.connectCallback) _this.connectCallback(message);
  });

  _defineProperty(this, "onConnect", function (callback) {
    _this.connectCallback = callback;
  });

  _defineProperty(this, "onMessage", function (callback) {
    _this.messageCallback = callback;
  });

  _defineProperty(this, "onError", function (callback) {
    _this.errorCallback = callback;
  });

  _defineProperty(this, "onDisconnect", function (callback) {
    _this.disconnectCallback = callback;
  });

  _defineProperty(this, "disconnect", function () {
    throw new Error('The method disconnect MUST be implemented');
  });

  this.version = env.version;
  this.config = env.config;
  this.logger = env.logger;
  this.pubSub = env.pubSub;
  this.params = params;
  this.name = name;
  this.messageCallback = null;
  this.connectCallback = null;
  this.errorCallback = null;
  this.disconnectCallback = null;
  this.axios = (0, _axiosEnrich["default"])(_axios["default"], !this.params.noProxy && env.agent ? env.agent : null, "".concat(env.clientId, "/").concat(env.version));
});

exports["default"] = Connector;

_defineProperty(Connector, "transform", function (message) {
  throw new Error('The method transform (STATIC) MUST be implemented');
});