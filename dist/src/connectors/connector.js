"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _redaxios = _interopRequireDefault(require("redaxios"));
var _axiosEnrich = _interopRequireDefault(require("../utils/axiosEnrich"));
var _ipSub = _interopRequireDefault(require("ip-sub"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
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
var Connector = exports["default"] = /*#__PURE__*/_createClass(function Connector(name, params, env) {
  var _this = this;
  _classCallCheck(this, Connector);
  _defineProperty(this, "_parseFilters", function (callback) {
    var _this$params$blacklis = _this.params.blacklistSources,
      blacklistSources = _this$params$blacklis === void 0 ? [] : _this$params$blacklis;
    if (blacklistSources) {
      var filters = {
        asns: blacklistSources.filter(function (i) {
          return Number.isInteger(i);
        }),
        prefixes: blacklistSources.filter(function (i) {
          return _ipSub["default"].isValidPrefix(i) || _ipSub["default"].isValidIP(i);
        }).map(function (i) {
          return _ipSub["default"].toPrefix(i);
        })
      };
      var generateCallback = function generateCallback(filters, callback) {
        return function (message) {
          var data = message.data;
          if (data && (data.peerAS || data.peer)) {
            var messagePeer = _ipSub["default"].toPrefix(data.peer);
            if (!filters.prefixes.some(function (prefix) {
              return _ipSub["default"].isEqualPrefix(prefix, messagePeer) || _ipSub["default"].isSubnet(prefix, messagePeer);
            }) && !filters.asns.includes(data.peerAS)) {
              return callback(message);
            }
          } else {
            return callback(message);
          }
        };
      };
      return generateCallback(filters, callback);
    } else {
      return null;
    }
  });
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
    var filterCallback = _this._parseFilters(callback);
    if (filterCallback) {
      _this.messageCallback = filterCallback;
    } else {
      _this.messageCallback = callback;
    }
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
  this.axios = (0, _axiosEnrich["default"])(_redaxios["default"], !this.params.noProxy && env.agent ? env.agent : null, "".concat(env.clientId, "/").concat(env.version));
});
_defineProperty(Connector, "transform", function (message) {
  throw new Error('The method transform (STATIC) MUST be implemented');
});