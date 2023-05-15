"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _report = _interopRequireDefault(require("./report"));
var _syslogClient = _interopRequireDefault(require("syslog-client"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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
var ReportSyslog = /*#__PURE__*/function (_Report) {
  _inherits(ReportSyslog, _Report);
  var _super = _createSuper(ReportSyslog);
  function ReportSyslog(channels, params, env) {
    var _this;
    _classCallCheck(this, ReportSyslog);
    _this = _super.call(this, channels, params, env);
    _defineProperty(_assertThisInitialized(_this), "_getMessage", function (channel, content) {
      return _this.parseTemplate(_this.params.templates[channel] || _this.params.templates["default"], _this.getContext(channel, content));
    });
    _defineProperty(_assertThisInitialized(_this), "_connectToSyslog", function () {
      if (!_this.connecting) {
        _this.connecting = new Promise(function (resolve, reject) {
          if (_this.connected) {
            resolve(true);
          } else {
            _this.client = _syslogClient["default"].createClient(_this.host, _this.options);
            _this.connected = true;
            _this.client.on("close", function (error) {
              this.logger.log({
                level: 'error',
                message: 'Syslog disconnected: ' + error
              });
            });
            _this.client.on("error", function (error) {
              this.logger.log({
                level: 'error',
                message: 'Syslog: ' + error
              });
            });
            resolve(true);
          }
        });
      }
      return _this.connecting;
    });
    _defineProperty(_assertThisInitialized(_this), "report", function (channel, content) {
      return _this._connectToSyslog().then(function () {
        var message = _this._getMessage(channel, content);
        _this.logger.log({
          level: 'info',
          message: "[reportSyslog] sending report to: ".concat(_this.options.syslogHostname)
        });
        _this.client.log(message, {}, function (error) {
          if (error) {
            _this.logger.log({
              level: 'error',
              message: 'Syslog: ' + error
            });
          }
        });
      });
    });
    _this.client = null;
    _this.connected = false;
    _this.connecting = null;
    _this.host = params.host;
    _this.options = {
      syslogHostname: params.host,
      transport: params.transport === 'tcp' ? _syslogClient["default"].Transport.Tcp : _syslogClient["default"].Transport.Udp,
      port: params.port
    };
    return _this;
  }
  return _createClass(ReportSyslog);
}(_report["default"]);
exports["default"] = ReportSyslog;