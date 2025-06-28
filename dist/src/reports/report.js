"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _moment = _interopRequireDefault(require("moment"));
var _brembo = _interopRequireDefault(require("brembo"));
var _redaxios = _interopRequireDefault(require("redaxios"));
var _axiosEnrich = _interopRequireDefault(require("../utils/axiosEnrich"));
var _rpkiValidator = _interopRequireDefault(require("rpki-validator"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
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
var Report = exports["default"] = /*#__PURE__*/_createClass(function Report(channels, params, env) {
  var _this = this;
  _classCallCheck(this, Report);
  _defineProperty(this, "getBGPlayLink", function (prefix, start, end) {
    var instant = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var rrcs = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [0, 1, 2, 5, 6, 7, 10, 11, 13, 14, 15, 16, 18, 20];
    var bgplayTimeOffset = 5 * 60; // 5 minutes
    return _brembo["default"].build("https://bgplay.massimocandela.com/", {
      path: [],
      params: {
        "resource": prefix,
        "ignoreReannouncements": true,
        "starttime": (0, _moment["default"])(start).utc().unix() - bgplayTimeOffset,
        "endtime": (0, _moment["default"])(end).utc().unix(),
        "rrcs": rrcs.join(","),
        "instant": null,
        "type": "bgp"
      }
    });
  });
  _defineProperty(this, "getRpkiLink", function (prefix, asn) {
    asn = asn && asn.getValue() || [];
    asn = Array.isArray(asn) ? [] : [asn];
    return _brembo["default"].build("https://rpki.massimocandela.com/", {
      path: ["#", prefix].concat(asn),
      params: {
        "sources": _rpkiValidator["default"].providers.join(",")
      }
    });
  });
  _defineProperty(this, "getContext", function (channel, content) {
    try {
      var context = {
        summary: content.message,
        earliest: (0, _moment["default"])(content.earliest).utc().format("YYYY-MM-DD HH:mm:ss"),
        latest: (0, _moment["default"])(content.latest).utc().format("YYYY-MM-DD HH:mm:ss"),
        channel: channel,
        type: content.origin,
        bgplay: "",
        rpkiLink: "",
        slackUrl: "",
        markDownUrl: "",
        pathNumber: 0,
        paths: ""
      };
      var matched = null;
      var pathsCount = {};
      var sortedPathIndex;
      if (_this.params.showPaths > 0) {
        content.data.filter(function (i) {
          var _i$matchedMessage;
          return (i === null || i === void 0 || (_i$matchedMessage = i.matchedMessage) === null || _i$matchedMessage === void 0 || (_i$matchedMessage = _i$matchedMessage.path) === null || _i$matchedMessage === void 0 ? void 0 : _i$matchedMessage.length()) > 1;
        }).map(function (i) {
          return JSON.stringify(i.matchedMessage.path.getValues().slice(channel === "path" ? 0 : 1));
        }).forEach(function (path) {
          if (!pathsCount[path]) {
            pathsCount[path] = 0;
          }
          pathsCount[path]++;
        });
        sortedPathIndex = Object.keys(pathsCount).map(function (key) {
          return [key, pathsCount[key]];
        });
        sortedPathIndex.sort(function (first, second) {
          return second[1] - first[1];
        });
        context.pathNumber = Math.min(_this.params.showPaths, sortedPathIndex.length);
        context.paths = sortedPathIndex.slice(0, _this.params.showPaths).map(function (i) {
          return i[0];
        }).join(",");
      }
      switch (channel) {
        case "hijack":
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description;
          context.asn = matched.asn.toString();
          context.peers = _toConsumableArray(new Set(content.data.map(function (alert) {
            return alert.matchedMessage.peer;
          }))).length;
          context.neworigin = content.data[0].matchedMessage.originAS;
          context.newprefix = content.data[0].matchedMessage.prefix;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          break;
        case "visibility":
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description;
          context.asn = matched.asn.toString();
          context.peers = _toConsumableArray(new Set(content.data.map(function (alert) {
            return alert.matchedMessage.peer;
          }))).length;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          break;
        case "newprefix":
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description;
          context.asn = matched.asn.toString();
          context.peers = _toConsumableArray(new Set(content.data.map(function (alert) {
            return alert.matchedMessage.peer;
          }))).length;
          context.neworigin = content.data[0].matchedMessage.originAS;
          context.newprefix = content.data[0].matchedMessage.prefix;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          break;
        case "software-update":
          break;
        case "path":
          break;
        case "misconfiguration":
          context.asn = content.data[0].matchedRule.asn.toString();
          context.prefix = content.data[0].matchedMessage.prefix;
          break;
        case "rpki":
          matched = content.data[0].matchedRule;
          context.extra = content.data[0].extra;
          context.asn = (matched.asn || "").toString();
          context.prefix = matched.prefix || content.data[0].matchedMessage.prefix;
          context.description = matched.description || "";
          context.neworigin = content.data[0].matchedMessage.originAS;
          context.newprefix = content.data[0].matchedMessage.prefix;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          context.rpkiLink = _this.getRpkiLink(context.newprefix, context.neworigin);
          context.slackUrl = " [<".concat(context.rpkiLink, "|see>]");
          context.markDownUrl = " [[see](".concat(context.rpkiLink, ")]");
          break;
        case "roa":
          matched = content.data[0].matchedRule;
          context.extra = content.data[0].extra;
          context.asn = (matched.asn || "").toString();
          context.prefix = matched.prefix || content.data[0].matchedMessage.prefix;
          context.description = matched.description || "";
          break;
        case "path-neighbors":
          context.extra = content.data[0].extra;
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description || "";
          context.asn = (matched.asn || "").toString();
          break;
        default:
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description || "";
          context.asn = (matched.asn || "").toString();
      }
      return context;
    } catch (error) {
      // This MUST never happen. But if it happens we need to send a basic alert anyway and don't crash
      _this.logger.log({
        level: "error",
        message: "It was not possible to generate a context: ".concat(error)
      });
      return {
        summary: content.message
      };
    }
  });
  _defineProperty(this, "parseTemplate", function (template, context) {
    return template.replace(/\${([^}]*)}/g, function (r, k) {
      return context[k];
    });
  });
  _defineProperty(this, "report", function (message, content) {
    throw new Error("The method report must be implemented");
  });
  _defineProperty(this, "getUserGroup", function (group) {
    throw new Error("The method getUserGroup must be implemented");
  });
  this.config = env.config;
  this.logger = env.logger;
  this.pubSub = env.pubSub;
  this.params = params;
  this.enabled = true;
  var _iterator = _createForOfIteratorHelper(channels),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var channel = _step.value;
      env.pubSub.subscribe(channel, function (content, message) {
        return _this.report(message, content);
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  this.axios = (0, _axiosEnrich["default"])(_redaxios["default"], !this.params.noProxy && env.agent ? env.agent : null, "".concat(env.clientId, "/").concat(env.version));
});