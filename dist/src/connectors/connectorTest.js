"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _connector = _interopRequireDefault(require("./connector"));
var _model = require("../model");
var _ipSub = _interopRequireDefault(require("ip-sub"));
var _class;
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _callSuper(_this, derived, args) {
  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      return !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    } catch (e) {
      return false;
    }
  }
  derived = _getPrototypeOf(derived);
  return _possibleConstructorReturn(_this, isNativeReflectConstruct() ? Reflect.construct(derived, args || [], _getPrototypeOf(_this).constructor) : derived.apply(_this, args));
}
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
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
  _inherits(ConnectorTest, _Connector);
  function ConnectorTest(name, _params, env) {
    var _this;
    _classCallCheck(this, ConnectorTest);
    _this = _callSuper(this, ConnectorTest, [name, _params, env]);
    _defineProperty(_assertThisInitialized(_this), "connect", function () {
      _this._connect("Test connector connected");
      return Promise.resolve();
    });
    _defineProperty(_assertThisInitialized(_this), "_fadeOffTest", function (fade) {
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
    _defineProperty(_assertThisInitialized(_this), "subscribe", function (params) {
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
                // Monitored, path with wrong downstream
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
                // Monitored, path with wrong upstream
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
          }];
          break;
        default:
          return;
      }
      _this.timer = setInterval(function () {
        updates.forEach(function (update) {
          _this._message(update);
          if (type === 'visibility') {
            var peer = update.data.peer.split('.');
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
  return _createClass(ConnectorTest);
}(_connector["default"]);
_class = ConnectorTest;
_defineProperty(ConnectorTest, "transform", function (message) {
  if (message.type === 'ris_message') {
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
      throw new Error("Error during transform (".concat(_class.name, "): ") + error.message);
    }
  } else if (message.type === 'ris_error') {
    throw new Error("Error from RIS: " + message.data.message);
  }
});