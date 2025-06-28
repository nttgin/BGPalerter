"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _cluster = _interopRequireDefault(require("cluster"));
var _fs = _interopRequireDefault(require("fs"));
var _inputYml = _interopRequireDefault(require("./inputs/inputYml"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * 	BSD 3-Clause License
 *
 * Copyright (c) 2019, NTT Ltd.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// Default input connector
var Worker = exports["default"] = /*#__PURE__*/_createClass(function Worker(_ref) {
  var _this = this;
  var configFile = _ref.configFile,
    volume = _ref.volume,
    configConnector = _ref.configConnector,
    inputConnector = _ref.inputConnector,
    groupFile = _ref.groupFile;
  _classCallCheck(this, Worker);
  _defineProperty(this, "main", function (worker) {
    var LossyBuffer = require("./utils/lossyBuffer")["default"];
    var ConnectorFactory = require("./connectorFactory")["default"];
    console.log("BGPalerter, version:", _this.version, "environment:", _this.config.environment);

    // Write pid on a file
    if (_this.config.pidFile) {
      try {
        _fs["default"].writeFileSync(_this.config.pidFile, (process.pid || "").toString());
      } catch (error) {
        _this.logger.log({
          level: "error",
          message: "Cannot write pid file: " + error
        });
      }
    }
    var connectorFactory = new ConnectorFactory();
    if (_this.config.uptimeMonitor) {
      _this.logger.log({
        level: "error",
        message: "The uptime monitor configuration changed. Please see the documentation https://github.com/nttgin/BGPalerter/blob/main/docs/process-monitors.md"
      });
    }
    if (_this.config.processMonitors) {
      var _iterator = _createForOfIteratorHelper(_this.config.processMonitors),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var uptimeEntry = _step.value;
          var UptimeModule = require("./processMonitors/" + uptimeEntry.file)["default"];
          new UptimeModule(connectorFactory, uptimeEntry.params);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    var bufferCleaningInterval = 200;
    _this.config.maxMessagesPerSecond = _this.config.maxMessagesPerSecond || 6000;
    var buffer = new LossyBuffer(parseInt(_this.config.maxMessagesPerSecond / (1000 / bufferCleaningInterval)), bufferCleaningInterval, _this.logger);
    connectorFactory.loadConnectors();
    return connectorFactory.connectConnectors(_this.input).then(function () {
      var _iterator2 = _createForOfIteratorHelper(connectorFactory.getConnectors()),
        _step2;
      try {
        var _loop = function _loop() {
          var connector = _step2.value;
          connector.onMessage(function (message) {
            buffer.add({
              connector: connector.name,
              message: message
            });
          });
          if (worker) {
            buffer.onData(function (message) {
              worker.send(message);
            });
          } else {
            buffer.onData(function (message) {
              _this.pubSub.publish("data", message);
            });
          }
        };
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    })["catch"](function (error) {
      _this.logger.log({
        level: "error",
        message: error
      });
    });
  });
  global.EXTERNAL_CONFIG_CONNECTOR = global.EXTERNAL_CONFIG_CONNECTOR || configConnector;
  global.EXTERNAL_INPUT_CONNECTOR = global.EXTERNAL_INPUT_CONNECTOR || inputConnector;
  global.EXTERNAL_CONFIG_FILE = global.EXTERNAL_CONFIG_FILE || configFile;
  global.EXTERNAL_GROUP_FILE = global.EXTERNAL_GROUP_FILE || groupFile;
  global.EXTERNAL_VOLUME_DIRECTORY = global.EXTERNAL_VOLUME_DIRECTORY || volume;
  var env = require("./env");
  this.config = env.config;
  this.logger = env.logger;
  this.input = new (global.EXTERNAL_INPUT_CONNECTOR || _inputYml["default"])(env);
  this.pubSub = env.pubSub;
  this.version = env.version;
  if (!this.config.multiProcess) {
    var Consumer = require("./consumer")["default"];
    this.main();
    new Consumer(env, this.input);
  } else {
    if (_cluster["default"].isMaster) {
      this.main(_cluster["default"].fork());
    } else {
      var _Consumer = require("./consumer")["default"];
      new _Consumer(env, this.input);
    }
  }
});