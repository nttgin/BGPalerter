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
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
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
 */
var ConnectorRISDump = exports["default"] = /*#__PURE__*/function (_Connector) {
  _inherits(ConnectorRISDump, _Connector);
  function ConnectorRISDump(name, params, env) {
    var _this;
    _classCallCheck(this, ConnectorRISDump);
    _this = _callSuper(this, ConnectorRISDump, [name, params, env]);
    _defineProperty(_assertThisInitialized(_this), "_shouldDownloadDump", function () {
      return !_this.lastRun || _this.lastRun.diff((0, _moment["default"])(), 'hours') > 2;
    });
    _defineProperty(_assertThisInitialized(_this), "connect", function () {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    });
    _defineProperty(_assertThisInitialized(_this), "_loadResource", function (resource) {
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
          level: 'error',
          message: "Cannot download historic RIS data ".concat(error)
        });
      });
    });
    _defineProperty(_assertThisInitialized(_this), "_subscribe", function (input) {
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
              level: 'error',
              message: error
            });
          });
          return (0, _batchPromises["default"])(1, dumps, _this._loadResource);
        }
      }
    });
    _defineProperty(_assertThisInitialized(_this), "subscribe", function (input) {
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
          level: 'error',
          message: error
        });
      });
    }
    return _this;
  }
  return _createClass(ConnectorRISDump);
}(_connector["default"]);
_defineProperty(ConnectorRISDump, "transform", function (message) {
  return [message];
});
;