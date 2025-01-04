"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _redaxios = _interopRequireDefault(require("redaxios"));
var _axiosEnrich = _interopRequireDefault(require("../utils/axiosEnrich"));
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
var Monitor = exports["default"] = /*#__PURE__*/_createClass(function Monitor(name, channel, params, env, input) {
  var _this = this;
  _classCallCheck(this, Monitor);
  _defineProperty(this, "updateMonitoredResources", function () {
    throw new Error('The method updateMonitoredResources must be implemented in ' + _this.name);
  });
  _defineProperty(this, "monitor", function (message) {
    return new Promise(function (resolve, reject) {
      reject("You must implement a monitor method");
    });
  });
  _defineProperty(this, "filter", function (message) {
    throw new Error('The method filter must be implemented in ' + _this.name);
  });
  _defineProperty(this, "squashAlerts", function (alerts) {
    throw new Error('The method squashAlerts must be implemented in ' + _this.name);
  });
  _defineProperty(this, "_squash", function (id) {
    var alerts = _this.alerts[id] || [];
    if (alerts && alerts.length) {
      var message = _this.squashAlerts(alerts);
      if (message) {
        var firstAlert = alerts[0];
        var earliest = Infinity;
        var latest = -Infinity;
        var _iterator = _createForOfIteratorHelper(alerts),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _alert$matchedMessage, _alert$matchedMessage2, _alert$matchedMessage3, _alert$matchedMessage4;
            var alert = _step.value;
            earliest = Math.min((_alert$matchedMessage = (_alert$matchedMessage2 = alert.matchedMessage) === null || _alert$matchedMessage2 === void 0 ? void 0 : _alert$matchedMessage2.timestamp) !== null && _alert$matchedMessage !== void 0 ? _alert$matchedMessage : alert.timestamp, earliest);
            latest = Math.max((_alert$matchedMessage3 = (_alert$matchedMessage4 = alert.matchedMessage) === null || _alert$matchedMessage4 === void 0 ? void 0 : _alert$matchedMessage4.timestamp) !== null && _alert$matchedMessage3 !== void 0 ? _alert$matchedMessage3 : alert.timestamp, latest);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return {
          id: id,
          truncated: _this.truncated[id] || false,
          origin: _this.name,
          earliest: earliest,
          latest: latest,
          affected: firstAlert.affected,
          message: message,
          data: alerts
        };
      }
    }
  });
  _defineProperty(this, "publishAlert", function (id, affected, matchedRule, matchedMessage, extra) {
    var now = new Date().getTime();
    var context = {
      timestamp: now,
      affected: affected,
      matchedRule: matchedRule,
      matchedMessage: matchedMessage,
      extra: extra
    };
    if (!_this.sent[id] || !_this.config.alertOnlyOnce && now > _this.sent[id] + _this.internalConfig.notificationInterval) {
      _this.alerts[id] = _this.alerts[id] || [];
      _this.alerts[id].push(context);

      // Check if for each alert group the maxDataSamples parameter is respected
      if (_this.alerts[id].length > _this.maxDataSamples) {
        if (!_this.truncated[id]) {
          _this.truncated[id] = _this.alerts[id][0].timestamp; // Mark as truncated
        }
        _this.alerts[id] = _this.alerts[id].slice(-_this.maxDataSamples); // Truncate
      }
      _this._publishGroupId(id, now);
      return true;
    }
    return false;
  });
  _defineProperty(this, "_publishFadeOffGroups", function () {
    var now = new Date().getTime();
    for (var id in _this.fadeOff) {
      _this._publishGroupId(id, now);
    }
    if (!_this.config.alertOnlyOnce) {
      for (var _id in _this.alerts) {
        if (now > _this.sent[_id] + _this.internalConfig.notificationInterval) {
          delete _this.sent[_id];
        }
      }
    }
  });
  _defineProperty(this, "_retrieveStatus", function () {
    if (_this.config.persistStatus && _this.storage) {
      _this.storage.get("status-".concat(_this.name)).then(function (_ref) {
        var _ref$sent = _ref.sent,
          sent = _ref$sent === void 0 ? {} : _ref$sent,
          _ref$truncated = _ref.truncated,
          truncated = _ref$truncated === void 0 ? {} : _ref$truncated,
          _ref$fadeOff = _ref.fadeOff,
          fadeOff = _ref$fadeOff === void 0 ? {} : _ref$fadeOff;
        _this.sent = sent;
        _this.truncated = truncated;
        _this.fadeOff = fadeOff;
      })["catch"](function (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      });
    }
  });
  _defineProperty(this, "_persistStatus", function () {
    if (_this._persistStatusTimer) {
      clearTimeout(_this._persistStatusTimer);
    }
    _this._persistStatusTimer = setTimeout(_this._persistStatusHelper, 5000);
  });
  _defineProperty(this, "_persistStatusHelper", function () {
    if (_this.config.persistStatus && _this.storage) {
      var status = {
        sent: _this.sent,
        truncated: _this.truncated,
        fadeOff: _this.fadeOff
      };
      if (Object.values(status).some(function (i) {
        return Object.keys(i).length > 0;
      })) {
        // If there is anything in the cache
        _this.storage.set("status-".concat(_this.name), status)["catch"](function (error) {
          _this.logger.log({
            level: 'error',
            message: error
          });
        });
      }
    }
  });
  _defineProperty(this, "_publishGroupId", function (id, now) {
    var group = _this._squash(id);
    if (group) {
      _this._publishOnChannel(group);
      _this.sent[id] = now;
      delete _this.alerts[id];
      delete _this.fadeOff[id];
      delete _this.truncated[id];
    } else if (_this.fadeOff[id]) {
      if (now > _this.fadeOff[id] + _this.internalConfig.fadeOff) {
        delete _this.fadeOff[id];
        delete _this.alerts[id];
        delete _this.truncated[id];
      }
    } else {
      _this.fadeOff[id] = _this.fadeOff[id] || now;
    }
  });
  _defineProperty(this, "_publishOnChannel", function (alert) {
    _this.pubSub.publish(_this.channel, alert);
    _this._persistStatus();
    return alert;
  });
  _defineProperty(this, "getMonitoredAsMatch", function (originAS) {
    var monitored = _this.input.getMonitoredASns();
    var _iterator2 = _createForOfIteratorHelper(monitored),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var m = _step2.value;
        if (originAS.includes(m.asn)) {
          return m;
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    return null;
  });
  _defineProperty(this, "_filterMatched", function (verbose) {
    return function (matched) {
      if (matched) {
        var included = matched.includeMonitors.length > 0 ? matched.includeMonitors.includes(_this.name) : !matched.excludeMonitors.includes(_this.name);
        if (verbose) {
          return {
            matched: matched,
            included: included
          };
        } else if (included) {
          return matched;
        }
      }
      return null;
    };
  });
  _defineProperty(this, "getMoreSpecificMatches", function (prefix, includeIgnoredMorespecifics, verbose) {
    return _this.input.getMoreSpecificMatches(prefix, includeIgnoredMorespecifics).map(_this._filterMatched(verbose)).filter(function (i) {
      return !!i;
    });
  });
  this.config = env.config;
  this.pubSub = env.pubSub;
  this.logger = env.logger;
  this.rpki = env.rpki;
  this.input = input;
  this.storage = env.storage;
  this.params = params || {};
  this.maxDataSamples = this.params.maxDataSamples || 1000;
  this.name = name;
  this.channel = channel;
  this.monitored = [];
  this.axios = (0, _axiosEnrich["default"])(_redaxios["default"], !this.params.noProxy && env.agent ? env.agent : null, "".concat(env.clientId, "/").concat(env.version));
  this.alerts = {}; // Dictionary containing the alerts <id, Array>. The id is the "group" key of the alert.
  this.sent = {}; // Dictionary containing the last sent unix timestamp of each group <id, int>
  this.truncated = {}; // Dictionary containing <id, boolean> if the alerts Array for "id" is truncated according to maxDataSamples
  this.fadeOff = {}; // Dictionary containing the last alert unix timestamp of each group  <id, int> which contains alerts that have been triggered but are not ready yet to be sent (e.g., thresholdMinPeers not yet reached)

  this._retrieveStatus();
  this.internalConfig = {
    notificationInterval: (this.params.notificationIntervalSeconds || this.config.notificationIntervalSeconds || 14400) * 1000,
    checkFadeOffGroups: (this.config.checkFadeOffGroupsSeconds || 30) * 1000,
    fadeOff: this.config.fadeOffSeconds * 1000 || 60 * 6 * 1000
  };
  setInterval(this._publishFadeOffGroups, this.internalConfig.checkFadeOffGroups);
  this.input.onChange(function () {
    _this.updateMonitoredResources();
  });
});