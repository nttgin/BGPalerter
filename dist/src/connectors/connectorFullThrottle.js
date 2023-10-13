"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _connector = _interopRequireDefault(require("./connector"));
var _model = require("../model");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
                                                                                                                                                                                                                                                                                                                                                                                               */ // IMPORTANT: This Connector is just for stress tests during development. Please, ignore!
var ConnectorFullThrottle = exports["default"] = /*#__PURE__*/function (_Connector) {
  _inherits(ConnectorFullThrottle, _Connector);
  var _super = _createSuper(ConnectorFullThrottle);
  function ConnectorFullThrottle(name, params, env) {
    var _this;
    _classCallCheck(this, ConnectorFullThrottle);
    _this = _super.call(this, name, params, env);
    _defineProperty(_assertThisInitialized(_this), "connect", function () {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    });
    _defineProperty(_assertThisInitialized(_this), "subscribe", function (params) {
      return new Promise(function (resolve, reject) {
        resolve(true);
        _this._startStream();
      });
    });
    _defineProperty(_assertThisInitialized(_this), "_startStream", function () {
      setInterval(function () {
        // just create a huge amount of useless messages
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
        _this.updates.forEach(_this._message);
      }, 2);
    });
    _this.updates = [{
      data: {
        announcements: [{
          prefixes: ["175.254.205.0/25", "170.254.205.0/25", "2001:db8:123::/48"],
          next_hop: "124.0.0.3"
        }],
        peer: "124.0.0.3",
        path: [1, 2, 3, 65000]
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
    return _this;
  }
  return _createClass(ConnectorFullThrottle);
}(_connector["default"]);
_defineProperty(ConnectorFullThrottle, "transform", function (message) {
  if (message.type === 'ris_message') {
    message = message.data;
    var components = [];
    var announcements = message["announcements"] || [];
    var withdrawals = message["withdrawals"] || [];
    var aggregator = message["aggregator"] || null;
    var peer = message["peer"];
    var _iterator = _createForOfIteratorHelper(announcements),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var announcement = _step.value;
        var nextHop = announcement["next_hop"];
        var prefixes = announcement["prefixes"] || [];
        var path = new _model.Path(message["path"].map(function (i) {
          return new _model.AS(i);
        }));
        var originAS = path.getLast();
        var _iterator3 = _createForOfIteratorHelper(prefixes),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var prefix = _step3.value;
            components.push({
              type: "announcement",
              prefix: prefix,
              peer: peer,
              path: path,
              originAS: originAS,
              nextHop: nextHop,
              aggregator: aggregator
            });
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    var _iterator2 = _createForOfIteratorHelper(withdrawals),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _prefix = _step2.value;
        components.push({
          type: "withdrawal",
          prefix: _prefix,
          peer: peer
        });
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    return components;
  }
});