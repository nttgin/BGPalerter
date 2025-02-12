"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _reportHTTP = _interopRequireDefault(require("./reportHTTP"));
var _uuid = require("uuid");
var _brembo = _interopRequireDefault(require("brembo"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var reportMatrix = exports["default"] = /*#__PURE__*/function (_ReportHTTP) {
  function reportMatrix(channels, params, env) {
    var _this;
    _classCallCheck(this, reportMatrix);
    var hooks = {};
    for (var userGroup in (_params$roomIds = params === null || params === void 0 ? void 0 : params.roomIds) !== null && _params$roomIds !== void 0 ? _params$roomIds : []) {
      var _params$roomIds;
      hooks[userGroup] = _brembo["default"].build(params === null || params === void 0 ? void 0 : params.homeserverUrl, {
        path: ["_matrix", "client", "v3", "rooms", encodeURIComponent(params === null || params === void 0 ? void 0 : params.roomIds[userGroup]), "send", "m.room.message"]
      });
    }
    var matrixParams = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + params.accessToken
      },
      isTemplateJSON: true,
      showPaths: params.showPaths,
      hooks: hooks,
      name: "reportMatrix",
      method: "put",
      templates: {}
    };
    _this = _callSuper(this, reportMatrix, [channels, matrixParams, env]);
    _defineProperty(_this, "getUserGroup", function (group) {
      var transactionId = (0, _uuid.v4)();
      var groups = _this.params.hooks || _this.params.userGroups || {};
      var baseUrl = groups[group] || groups["default"];
      return _brembo["default"].build(baseUrl, {
        path: [transactionId]
      });
    });
    _defineProperty(_this, "getTemplate", function (group, channel, content) {
      return JSON.stringify({
        "msgtype": "m.text",
        "body": "${summary}${markDownUrl}"
      });
    });
    _this.roomIds = params.roomIds;
    if (!params.homeserverUrl || !params.accessToken) {
      _this.logger.log({
        level: "error",
        message: "".concat(_this.name, " reporting is not enabled: homeserverUrl and accessToken are required")
      });
      _this.enabled = false;
    }
    if (!params.roomIds || !params.roomIds["default"]) {
      _this.logger.log({
        level: "error",
        message: "".concat(_this.name, " reporting is not enabled: no default room id provided")
      });
      _this.enabled = false;
    }
    return _this;
  }
  _inherits(reportMatrix, _ReportHTTP);
  return _createClass(reportMatrix);
}(_reportHTTP["default"]);