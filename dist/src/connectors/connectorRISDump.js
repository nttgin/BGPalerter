"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _connector = _interopRequireDefault(require("./connector"));
var _batchPromises = _interopRequireDefault(require("batch-promises"));
var _brembo = _interopRequireDefault(require("brembo"));
var _moment = _interopRequireDefault(require("moment"));
var _model = require("../model");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
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
var ConnectorRISDump = exports["default"] = /*#__PURE__*/function (_Connector) {
  function ConnectorRISDump(name, params, env) {
    var _this;
    _classCallCheck(this, ConnectorRISDump);
    _this = _callSuper(this, ConnectorRISDump, [name, params, env]);
    _defineProperty(_this, "_shouldDownloadDump", function () {
      return !_this.lastRun || _this.lastRun.diff((0, _moment["default"])(), "hours") > 2;
    });
    _defineProperty(_this, "connect", function () {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    });
    _defineProperty(_this, "_loadResource", function (resource) {
      var stop = (0, _moment["default"])().subtract(2, "hours").utc();
      var url = _brembo["default"].build("https://stat.ripe.net/data/bgplay/data.json", {
        params: {
          resource: resource,
          rrcs: "0,11,13,14,15,16",
          "unix_timestamps": "TRUE",
          starttime: (0, _moment["default"])(stop).subtract(2, "minutes").unix(),
          stoptime: stop.unix()
        }
      });
      return _this.axios({
        responseType: "json",
        url: url
      }).then(function (data) {
        if (data && data.data && data.data.data && data.data.data.initial_state) {
          var dump = data.data.data.initial_state;
          var sent = {};
          var _iterator = _createForOfIteratorHelper(dump),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var _entry = _step.value;
              var path = new _model.Path((_entry.path || []).map(function (i) {
                return new _model.AS(i);
              }));
              sent[_entry.target_prefix] = true;
              _this._message({
                type: "announcement",
                prefix: _entry.target_prefix,
                peer: _entry.source_id.split("-")[1],
                path: path,
                originAS: path.getLast(),
                nextHop: null,
                aggregator: null,
                timestamp: stop.valueOf(),
                communities: _entry.community
              });
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          if (_this.withdrawNotVisible) {
            // This feature is not reachable for now
            var _iterator2 = _createForOfIteratorHelper(dump),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var entry = _step2.value;
                if (!sent[entry.target_prefix]) {
                  _this._message({
                    type: "withdrawal",
                    prefix: entry.target_prefix,
                    peer: null,
                    timestamp: stop.valueOf()
                  });
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        }
      })["catch"](function (error) {
        _this.logger.log({
          level: "error",
          message: "Cannot download historic RIS data ".concat(error)
        });
      });
    });
    _defineProperty(_this, "_subscribe", function (input) {
      if (_this._shouldDownloadDump()) {
        var asns = input.getMonitoredASns().map(function (i) {
          return i.asn;
        });
        var prefixes = input.getMonitoredPrefixes().filter(function (i) {
          return !asns.includes(i.asn);
        }).map(function (i) {
          return i.prefix;
        });
        var dumps = [].concat(_toConsumableArray(asns), _toConsumableArray(prefixes));
        if (dumps.length) {
          _this.storage.set("run-".concat(_this.name), _moment["default"].utc().unix())["catch"](function (error) {
            _this.logger.log({
              level: "error",
              message: error
            });
          });
          return (0, _batchPromises["default"])(1, dumps, _this._loadResource);
        }
      }
    });
    _defineProperty(_this, "subscribe", function (input) {
      _this._subscribe(input);
      input.onChange(function () {
        if (_this._timeoutFileChange) {
          clearTimeout(_this._timeoutFileChange);
        }
        _this._timeoutFileChange = setTimeout(function () {
          _this._subscribe(input);
        }, 2000);
      });
      return Promise.resolve();
    });
    _this.withdrawNotVisible = _this.params.withdrawNotVisible || false;
    _this.storage = env.storage;
    _this.lastRun = null;
    if (_this.storage) {
      _this.storage.get("run-".concat(_this.name)).then(function (date) {
        if (date && !isNaN(date)) {
          _this.lastRun = _moment["default"].unix(parseInt(date)).utc();
        }
      })["catch"](function (error) {
        _this.logger.log({
          level: "error",
          message: error
        });
      });
    }
    return _this;
  }
  _inherits(ConnectorRISDump, _Connector);
  return _createClass(ConnectorRISDump);
}(_connector["default"]);
_defineProperty(ConnectorRISDump, "transform", function (message) {
  return [message];
});
;