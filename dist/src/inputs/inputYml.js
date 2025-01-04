"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _jsYaml = _interopRequireDefault(require("js-yaml"));
var _fs = _interopRequireDefault(require("fs"));
var _input = _interopRequireDefault(require("./input"));
var _ipSub = _interopRequireDefault(require("ip-sub"));
var _model = require("../model");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var InputYml = exports["default"] = /*#__PURE__*/function (_Input) {
  function InputYml(env) {
    var _this;
    _classCallCheck(this, InputYml);
    _this = _callSuper(this, InputYml, [env]);
    _defineProperty(_this, "loadPrefixes", function () {
      _this.defaultPrefixFile = _this.config.volume + _this.config.monitoredPrefixesFiles[0];
      if (!_fs["default"].existsSync(_this.defaultPrefixFile)) {
        return _this.generate().then(function () {
          return _this._loadPrefixes();
        });
      }
      return _this._loadPrefixes();
    });
    _defineProperty(_this, "_watchPrefixFile", function (file) {
      if (!_this.watcherSet) {
        _this.watcherSet = true;
        _fs["default"].watchFile(file, function () {
          if (_this._watchPrefixFileTimer) {
            clearTimeout(_this._watchPrefixFileTimer);
          }
          _this._watchPrefixFileTimer = setTimeout(function () {
            _this.prefixes = [];
            _this.asns = [];
            _this._loadPrefixes().then(function () {
              return _this._change();
            })["catch"](function (error) {
              _this.logger.log({
                level: 'error',
                message: error
              });
            });
          }, 5000);
        });
      }
    });
    _defineProperty(_this, "_loadPrefixes", function () {
      return new Promise(function (resolve, reject) {
        var uniquePrefixes = {};
        var uniqueAsns = {};
        var newPrefixList = [];
        var newAsList = [];
        var _iterator = _createForOfIteratorHelper(_this.config.monitoredPrefixesFiles),
          _step;
        try {
          var _loop = function _loop() {
              var prefixesFile = _step.value;
              var file = _this.config.volume + prefixesFile;
              var monitoredPrefixesFile = {};
              var fileContent;
              if (_fs["default"].existsSync(file)) {
                fileContent = _fs["default"].readFileSync(file, 'utf8');
                try {
                  monitoredPrefixesFile = _jsYaml["default"].load(fileContent) || {};
                  _this._watchPrefixFile(file);
                } catch (error) {
                  reject(new Error("The file " + prefixesFile + " is not valid yml: " + error.message.split(":")[0]));
                  return {
                    v: void 0
                  };
                }
                if (Object.keys(monitoredPrefixesFile).length === 0) {
                  reject(new Error("No prefixes to monitor in " + prefixesFile + ". Please read https://github.com/nttgin/BGPalerter/blob/main/docs/prefixes.md"));
                  return {
                    v: void 0
                  };
                }
                if (_this.validate(monitoredPrefixesFile)) {
                  if (monitoredPrefixesFile.options) {
                    _this.options = Object.assign(_this.options, monitoredPrefixesFile.options);
                    if (monitoredPrefixesFile.options.monitorASns) {
                      var newAsnSet = Object.keys(monitoredPrefixesFile.options.monitorASns).map(function (asn) {
                        if (uniqueAsns[asn]) {
                          reject(new Error("Duplicate entry for monitored AS " + asn));
                          return;
                        }
                        uniqueAsns[asn] = true;
                        var item = Object.assign({
                          asn: new _model.AS(asn),
                          group: ['default']
                        }, monitoredPrefixesFile.options.monitorASns[asn]);
                        if (item.upstreams && item.upstreams.length) {
                          item.upstreams = new _model.AS(item.upstreams);
                        }
                        if (item.downstreams && item.downstreams.length) {
                          item.downstreams = new _model.AS(item.downstreams);
                        }
                        return item;
                      });
                      newAsList = newAsList.concat(newAsnSet);
                    }
                  }
                  var monitoredPrefixes = Object.keys(monitoredPrefixesFile).filter(function (i) {
                    return i !== "options";
                  }).map(function (i) {
                    if (uniquePrefixes[i]) {
                      reject(new Error("Duplicate entry for " + i));
                      return;
                    }
                    uniquePrefixes[i] = true;
                    monitoredPrefixesFile[i].asn = new _model.AS(monitoredPrefixesFile[i].asn);
                    return Object.assign({
                      prefix: i,
                      group: ['default'],
                      ignore: false,
                      excludeMonitors: [],
                      includeMonitors: []
                    }, monitoredPrefixesFile[i]);
                  }).filter(function (i) {
                    return i !== null;
                  });
                  newPrefixList = newPrefixList.concat(monitoredPrefixes);
                }
              }
            },
            _ret;
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            _ret = _loop();
            if (_ret) return _ret.v;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        newPrefixList.sort(function (a, b) {
          return _ipSub["default"].sortByPrefixLength(b.prefix, a.prefix);
        });
        _this.asns = newAsList;
        _this.prefixes = newPrefixList;
        resolve(true);
      });
    });
    _defineProperty(_this, "validate", function (fileContent) {
      var prefixesError = [];
      var optionsError = [];
      var options = fileContent.options;
      if (options && options.monitorASns) {
        for (var item in options.monitorASns) {
          if (!new _model.AS(item).isValid()) {
            optionsError.push("Not a valid AS number in monitorASns");
          }
          var upstreams = options.monitorASns[item].upstreams;
          var downstreams = options.monitorASns[item].downstreams;
          if (upstreams && upstreams.length && !new _model.AS(upstreams).isValid()) {
            optionsError.push("One of the upstream ASes provided for AS".concat(item, " is not valid"));
          }
          if (downstreams && downstreams.length && !new _model.AS(downstreams).isValid()) {
            optionsError.push("One of the downstream ASes provided for AS".concat(item, " is not valid"));
          }
        }
      }
      prefixesError = Object.keys(fileContent).filter(function (i) {
        return i !== "options";
      }).map(function (prefix) {
        var item = fileContent[prefix];
        var asns;
        if (!prefix || !_ipSub["default"].isValidPrefix(prefix)) {
          return "Not a valid prefix: " + prefix;
        }
        if (_this.config.environment === "research") {
          item.asn = item.asn || 0;
        }
        if (["string", "number"].includes(_typeof(item.asn))) {
          asns = [item.asn];
        } else if (item.asn instanceof Array) {
          asns = item.asn;
        } else {
          return "Not a valid AS number for: " + prefix;
        }
        if (!new _model.AS(asns).isValid()) {
          return "Not a valid AS number for: " + prefix;
        }
        if (!["string", "number"].includes(_typeof(item.description))) {
          return "Not a valid description for: " + prefix;
        }
        if (typeof item.ignoreMorespecifics !== "boolean") {
          return "Not a valid ignoreMorespecifics value for: " + prefix;
        }
        if (item.ignore !== undefined && typeof item.ignore !== "boolean") {
          return "Not a valid ignore value for: " + prefix;
        }
        if (item.includeMonitors !== undefined && item.excludeMonitors !== undefined) {
          return "You can define only one of includeMonitor or excludeMonitor for: " + prefix;
        }
        if (item.excludeMonitors !== undefined && !Array.isArray(item.excludeMonitors)) {
          return "Not a valid excludeMonitor value for: " + prefix;
        }
        if (item.includeMonitors !== undefined && !Array.isArray(item.includeMonitors)) {
          return "Not a valid includeMonitor value for: " + prefix;
        }
        if (item.path) {
          (item.path.length ? item.path : [item.path]).map(function (rule) {
            if (!rule.matchDescription) {
              return "No matchDescription set";
            }
            _this._validateRegex(rule.match);
            _this._validateRegex(rule.notMatch);
            if (rule.maxLength && !(typeof rule.maxLength == "number" && rule.maxLength > 1)) {
              return "Not valid maxLength";
            }
            if (rule.minLength && !(typeof rule.minLength == "number" && rule.minLength > 1)) {
              return "Not valid minLength";
            }
          });
        }
        return null;
      });
      var errors = [].concat(_toConsumableArray(prefixesError), optionsError).filter(function (i) {
        return i != null;
      });
      errors.map(function (error) {
        throw new Error(error);
      });
      return errors.length === 0;
    });
    _defineProperty(_this, "_validateRegex", function (regex) {
      if (regex) {
        try {
          new RegExp(regex);
        } catch (e) {
          return "Not valid Path regex" + regex;
        }
      }
    });
    _defineProperty(_this, "getMonitoredMoreSpecifics", function () {
      return _this.prefixes.filter(function (p) {
        return !p.ignoreMorespecifics;
      });
    });
    _defineProperty(_this, "getMonitoredPrefixes", function () {
      return _this.prefixes;
    });
    _defineProperty(_this, "getMonitoredASns", function () {
      return _this.asns;
    });
    _defineProperty(_this, "save", function (content) {
      return new Promise(function (resolve, reject) {
        if (content && _typeof(content) === "object" && Object.keys(content).length > 0) {
          try {
            _fs["default"].writeFileSync(_this.defaultPrefixFile, _jsYaml["default"].dump(content));
            resolve();
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error("Empty or not valid prefix list"));
        }
      });
    });
    _defineProperty(_this, "retrieve", function () {
      return new Promise(function (resolve, reject) {
        var prefixes = {};
        var monitorASns = {};
        var _iterator2 = _createForOfIteratorHelper(_this.prefixes),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var rule = _step2.value;
            var item = JSON.parse(JSON.stringify(rule));
            prefixes[rule.prefix] = item;
            item.asn = rule.asn.getValue();
            delete item.prefix;
            if (!item.includeMonitors.length) {
              delete item.includeMonitors;
            }
            if (!item.excludeMonitors.length) {
              delete item.excludeMonitors;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        var _iterator3 = _createForOfIteratorHelper(_this.asns),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var asnRule = _step3.value;
            monitorASns[asnRule.asn.getValue()] = {
              group: [asnRule.group].flat(),
              upstreams: asnRule.upstreams ? asnRule.upstreams.numbers : null,
              downstreams: asnRule.downstreams ? asnRule.downstreams.numbers : null
            };
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        var options = Object.assign({}, _this.options, {
          monitorASns: monitorASns
        });
        resolve(_objectSpread(_objectSpread({}, prefixes), {}, {
          options: options
        }));
      });
    });
    _this.prefixes = [];
    _this.asns = [];
    _this.options = {};
    _this.watcherSet = false;
    if (!_this.config.monitoredPrefixesFiles || _this.config.monitoredPrefixesFiles.length === 0) {
      throw new Error("The monitoredPrefixesFiles key is missing in the config file");
    } else if (_this.config.monitoredPrefixesFiles.length === 1) {
      _this.setReGeneratePrefixList();
    }
    return _this;
  }
  _inherits(InputYml, _Input);
  return _createClass(InputYml);
}(_input["default"]);