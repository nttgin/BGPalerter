"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _report = _interopRequireDefault(require("./report"));
var _nodemailer = _interopRequireDefault(require("nodemailer"));
var _emailTemplates = _interopRequireDefault(require("./email_templates/emailTemplates"));
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
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
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
var ReportEmail = exports["default"] = /*#__PURE__*/function (_Report) {
  function ReportEmail(channels, params, env) {
    var _this;
    _classCallCheck(this, ReportEmail);
    _this = _callSuper(this, ReportEmail, [channels, params, env]);
    _defineProperty(_this, "getUserGroup", function (group) {
      var groups = _this.params.notifiedEmails || _this.params.userGroups;
      return groups[group] || groups["default"];
    });
    _defineProperty(_this, "getEmails", function (content) {
      var users = content.data.map(function (item) {
        if (item.matchedRule) {
          return item.matchedRule.group || "default";
        } else {
          return false;
        }
      }).filter(function (item) {
        return !!item;
      });
      try {
        return _toConsumableArray(new Set(users)).map(function (user) {
          return _this.getUserGroup(user);
        }).filter(function (item) {
          return !!item;
        });
      } catch (error) {
        _this.logger.log({
          level: "error",
          message: "Not all groups have an associated email address"
        });
      }
      return [];
    });
    _defineProperty(_this, "getEmailText", function (channel, content) {
      var context = _this.getContext(channel, content);
      var paths = JSON.parse("[".concat(context.paths, "]"));
      context.paths = paths.length ? paths.join("\n") : "Disabled";
      return _this.parseTemplate(_this.templates[channel], context);
    });
    _defineProperty(_this, "_sendEmail", function (email) {
      _this.transporter.sendMail(email)["catch"](function (error) {
        _this.logger.log({
          level: "error",
          message: error
        });
      });
    });
    _defineProperty(_this, "report", function (channel, content) {
      if (_this.enabled) {
        var emailGroups = _this.getEmails(content);
        var _iterator = _createForOfIteratorHelper(emailGroups),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var emails = _step.value;
            var text = _this.getEmailText(channel, content);
            if (text) {
              var to = emails.join(", ");
              _this.logger.log({
                level: "info",
                message: "[reportEmail] sending report to: ".concat(to)
              });
              _this.emailBacklog.push({
                from: _this.params.senderEmail,
                to: to,
                subject: "BGP alert: " + channel,
                text: text,
                headers: {
                  "auto-submitted": "auto-generated"
                }
              });
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    });
    _this.emailTemplates = new _emailTemplates["default"](_this.logger);
    _this.templates = {};
    _this.emailBacklog = [];
    if (!_this.getUserGroup("default")) {
      _this.enabled = false;
      _this.logger.log({
        level: "error",
        message: "In notifiedEmails, for reportEmail, a group named 'default' is required for communications to the admin."
      });
    } else {
      _this.transporter = _nodemailer["default"].createTransport(_this.params.smtp);
      var _iterator2 = _createForOfIteratorHelper(channels),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var channel = _step2.value;
          try {
            _this.templates[channel] = _this.emailTemplates.getTemplate(channel);
          } catch (error) {
            _this.logger.log({
              level: "error",
              message: channel + " template cannot be loaded"
            });
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      if (Object.keys(_this.templates).length === 0) {
        _this.enabled = false;
        _this.logger.log({
          level: "error",
          message: "Email templates cannot be associated to channels."
        });
      }
      setInterval(function () {
        var nextEmail = _this.emailBacklog.pop();
        if (nextEmail) {
          _this._sendEmail(nextEmail);
        }
      }, 3000);
    }
    return _this;
  }
  _inherits(ReportEmail, _Report);
  return _createClass(ReportEmail);
}(_report["default"]);