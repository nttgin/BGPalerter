"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _connector = _interopRequireDefault(require("./connector"));
var _model = require("../model");
var _ipSub = _interopRequireDefault(require("ip-sub"));
var _ConnectorTest;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
 */ // IMPORTANT: This Connector is used by the automated tests. Please, ignore!
var ConnectorTest = exports["default"] = /*#__PURE__*/function (_Connector) {
  function ConnectorTest(name, _params, env) {
    var _this;
    _classCallCheck(this, ConnectorTest);
    _this = _callSuper(this, ConnectorTest, [name, _params, env]);
    _defineProperty(_this, "connect", function () {
      _this._connect("Test connector connected");
      return Promise.resolve();
    });
    _defineProperty(_this, "_fadeOffTest", function (fade) {
      var updates = [{
        data: {
          withdrawals: ["165.24.225.0/24"],
          peer: "124.0.0.1"
        },
        type: "ris_message"
      }, {
        data: {
          withdrawals: ["165.24.225.0/24"],
          peer: "124.0.0.2"
        },
        type: "ris_message"
      }, {
        data: {
          withdrawals: ["165.24.225.0/24"],
          peer: "124.0.0.3"
        },
        type: "ris_message"
      }, {
        data: {
          withdrawals: ["165.24.225.0/24"],
          peer: "124.0.0.4"
        },
        type: "ris_message"
      }];
      _this._message(updates[0]);
      _this._message(updates[1]);
      _this._message(updates[2]);
      setTimeout(function () {
        _this._message(updates[3]);
      }, (_this.config.fadeOffSeconds + (fade ? -4 : 4)) * 1000); // depending on "fade" it goes in our out of the fading period
    });
    _defineProperty(_this, "subscribe", function (params) {
      var type = params.type || _this.params.testType;
      var updates;
      switch (type) {
        case "fade-off":
          return _this._fadeOffTest(false);
        case "fade-in":
          return _this._fadeOffTest(true);
        case "hijack":
          updates = [{
            data: {
              announcements: [{
                // RPKI valid announcement, no alert should be triggered (issue #358)
                prefixes: ["193.0.0.0/21"],
                next_hop: "1.2.3.4"
              }],
              peer: "1.2.3.5",
              path: [1, 2, 3, 3333]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["175.254.205.0/25", "170.254.205.0/25"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 4321]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["165.254.255.0/25"],
                next_hop: "124.0.0.2"
              }],
              peer: "124.0.0.2",
              path: [1, 2, 3, [4, 15562]]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a00:5884:ffff::/48"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 208585]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a00:5884::/32"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, [204092, 45]]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a00:5884::/32"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, [15563]]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a00:5884::/32"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 204092]
            },
            type: "ris_message"
          }];
          break;
        case "newprefix":
          updates = [{
            data: {
              announcements: [{
                prefixes: ["165.254.255.0/25"],
                next_hop: "124.0.0.2"
              }],
              peer: "124.0.0.2",
              path: [1, 2, 3, 15562]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a00:5884::/32"],
                next_hop: "124.0.0.2"
              }],
              peer: "124.0.0.2",
              path: [1, 2, 3, [45]]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a00:5884:ffff::/48"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 204092]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a0e:f40::/32"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 204092]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a0e:240::/32"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 1345]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["175.254.205.0/25", "170.254.205.0/25"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 1234]
            },
            type: "ris_message"
          }];
          break;
        case "visibility":
          updates = [{
            data: {
              withdrawals: ["165.254.225.0/24"],
              peer: "124.0.0.2"
            },
            type: "ris_message"
          }, {
            data: {
              withdrawals: ["2a00:5884::/32"],
              peer: "124.0.0.2"
            },
            type: "ris_message"
          }, {
            data: {
              withdrawals: ["2a00:5884:ffff::/48"],
              peer: "124.0.0.2"
            },
            type: "ris_message"
          }, {
            data: {
              withdrawals: ["2a0e:f40::/32"],
              peer: "124.0.0.2"
            },
            type: "ris_message"
          }, {
            data: {
              withdrawals: ["2001:db8:123::/48"],
              peer: "124.0.0.2"
            },
            type: "ris_message"
          }];
          break;
        case "path":
          updates = [{
            data: {
              announcements: [{
                prefixes: ["94.5.4.3/22", "98.5.4.3/22", "99.5.4.3/22"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 4321, 5060, 2914]
            },
            type: "ris_message"
          }];
          break;
        case "misconfiguration":
          updates = [{
            data: {
              announcements: [{
                prefixes: ["2.2.2.3/22"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.4",
              path: [1, 2, 3, 4321, 5060, 2914]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2001:db8:123::/48", "2001:db8:123::/49"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.10",
              path: [1, 2, 3, 4321, 65000]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2001:db8:123::/48", "2001:db8:123::/49"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.9",
              path: [1, 2, 3, 4321, 65000]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2001:db8:123::/48", "2001:db8:123::/49"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 4321, 65000]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2.2.2.5/22", "2001:db9:123::/49"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 4321, 5060, 2914]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2.2.2.3/22", "2001:db9:123::/49"],
                next_hop: "124.0.0.5"
              }],
              peer: "124.0.0.6",
              path: [1, 2, 3, 4321, 5060, 2914]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["2a0e:240::/32"],
                next_hop: "124.0.0.5"
              }],
              peer: "124.0.0.6",
              path: [1, 2, 3, 4321, 5060, 2914]
            },
            type: "ris_message"
          }];
          break;
        case "rpki":
          updates = [{
            data: {
              announcements: [{
                prefixes: ["82.112.100.0/24"],
                // Valid
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.4",
              path: [1, 2, 3, 4321, 2914]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["8.8.8.8/22"],
                // Not covered
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.4",
              path: [1, 2, 3, 4321, 5060, 2914]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["103.21.244.0/24"],
                // Invalid
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.4",
              path: [1, 2, 3, 4321, 13335]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["175.254.205.0/25", "170.254.205.0/25"],
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [1, 2, 3, 4321]
            },
            type: "ris_message"
          }];
          break;
        case "path-neighbors":
          updates = [{
            data: {
              announcements: [{
                prefixes: ["9.5.4.3/22"],
                // Path not ok but prefix not monitored
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 100, 101, 106]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["99.5.4.3/22"],
                // Monitored but path ok
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 100, 101, 104]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["99.5.4.3/22"],
                // Monitored, path with unexpected downstream
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 100, 101, 106]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["99.5.4.3/22"],
                // Monitored, path with unexpected upstream
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 30, 101, 104]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["99.5.4.3/22"],
                // Monitored, path with empty downstream ok
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 80]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["99.5.4.3/22"],
                // Monitored, path with empty downstream not ok
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 80, 100]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["99.5.4.3/22"],
                // Monitored, path with prepending and different origin
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 80, 102, 102, 102, 102, 50]
            },
            type: "ris_message"
          }, {
            data: {
              announcements: [{
                prefixes: ["99.5.4.3/22"],
                // Monitored, path with loop, skipped
                next_hop: "124.0.0.3"
              }],
              peer: "124.0.0.3",
              path: [98, 99, 80, 102, 50, 101, 50, 102]
            },
            type: "ris_message"
          }];
          break;
        default:
          return;
      }
      _this.timer = setInterval(function () {
        updates.forEach(function (update) {
          _this._message(update);
          if (type === "visibility") {
            var peer = update.data.peer.split(".");
            peer[3] = Math.min(parseInt(peer[3]) + 1, 254);
            update.data.peer = peer.join(".");
          }
        });
      }, 1000);
      return Promise.resolve();
    });
    _this.pubSub.subscribe("test-type", function (message, type) {
      clearInterval(_this.timer);
      _this.subscribe({
        type: message
      });
    });
    _this.subscribe({
      type: _params.testType
    });
    return _this;
  }
  _inherits(ConnectorTest, _Connector);
  return _createClass(ConnectorTest);
}(_connector["default"]);
_ConnectorTest = ConnectorTest;
_defineProperty(ConnectorTest, "transform", function (message) {
  if (message.type === "ris_message") {
    try {
      message = message.data;
      var components = [];
      var announcements = message["announcements"] || [];
      var aggregator = message["aggregator"] || null;
      var withdrawals = message["withdrawals"] || [];
      var peer = message["peer"];
      var communities = message["community"] || [];
      var timestamp = new Date().getTime();
      var path, originAS;
      if (message["path"] && message["path"].length) {
        path = new _model.Path(message["path"].map(function (i) {
          return new _model.AS(i);
        }));
        originAS = path.getLast();
      } else {
        path = new _model.Path([]);
        originAS = null;
      }
      if (originAS && path.length()) {
        var _iterator = _createForOfIteratorHelper(announcements),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var announcement = _step.value;
            var nextHop = announcement["next_hop"];
            if (_ipSub["default"].isValidIP(nextHop)) {
              var prefixes = (announcement["prefixes"] || []).filter(function (prefix) {
                return _ipSub["default"].isValidPrefix(prefix);
              });
              var _iterator2 = _createForOfIteratorHelper(prefixes),
                _step2;
              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var prefix = _step2.value;
                  components.push({
                    type: "announcement",
                    prefix: prefix,
                    peer: peer,
                    path: path,
                    originAS: originAS,
                    nextHop: nextHop,
                    aggregator: aggregator,
                    timestamp: timestamp,
                    communities: communities
                  });
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      var _iterator3 = _createForOfIteratorHelper(withdrawals),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _prefix = _step3.value;
          components.push({
            type: "withdrawal",
            prefix: _prefix,
            peer: peer,
            timestamp: timestamp
          });
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return components;
    } catch (error) {
      throw new Error("Error during transform (".concat(_ConnectorTest.name, "): ") + error.message);
    }
  } else if (message.type === "ris_error") {
    throw new Error("Error from RIS: " + message.data.message);
  }
});