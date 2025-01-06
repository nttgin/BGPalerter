"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _ipSub = _interopRequireDefault(require("ip-sub"));
var _inquirer = _interopRequireDefault(require("inquirer"));
var _generatePrefixesList = _interopRequireDefault(require("../generatePrefixesList"));
var _longestPrefixMatch = _interopRequireDefault(require("longest-prefix-match"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
var Input = exports["default"] = /*#__PURE__*/_createClass(function Input(env) {
  var _this = this;
  _classCallCheck(this, Input);
  _defineProperty(this, "_isAlreadyContained", function (prefix, lessSpecifics) {
    var p1af, p1b;
    try {
      p1af = _ipSub["default"].getAddressFamily(prefix);
      p1b = _ipSub["default"].applyNetmask(prefix, p1af);
    } catch (error) {
      throw new Error("".concat(error.message, ": ").concat(prefix));
    }
    var _iterator = _createForOfIteratorHelper(lessSpecifics),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var p2 = _step.value;
        try {
          var p2af = _ipSub["default"].getAddressFamily(p2.prefix);
          if (p1af === p2af && _ipSub["default"].isSubnetBinary(_ipSub["default"].applyNetmask(p2.prefix, p2af), p1b)) {
            return true;
          }
        } catch (error) {
          throw new Error("".concat(error.message, ": ").concat(p2));
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return false;
  });
  _defineProperty(this, "onChange", function (callback) {
    _this.callbacks.push(callback);
  });
  _defineProperty(this, "_change", function () {
    var _iterator2 = _createForOfIteratorHelper(_this.asns),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var item = _step2.value;
        item.group = [item.group].flat();
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    _this.index = new _longestPrefixMatch["default"]();
    var _iterator3 = _createForOfIteratorHelper(_this.prefixes),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var _item = _step3.value;
        _item.group = [_item.group].flat();
        _this.index.addPrefix(_item.prefix, _objectSpread({}, _item));
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    var _iterator4 = _createForOfIteratorHelper(_this.callbacks),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var call = _step4.value;
        call();
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  });
  _defineProperty(this, "getMonitoredLessSpecifics", function () {
    if (!_this.prefixes.length) {
      return [];
    }
    var lessSpecifics = [];
    try {
      var prefixes = _this.prefixes;
      lessSpecifics.push(prefixes[prefixes.length - 1]);
      for (var n = prefixes.length - 2; n >= 0; n--) {
        var p1 = prefixes[n];
        if (!_this._isAlreadyContained(p1.prefix, lessSpecifics)) {
          lessSpecifics.push(p1);
        }
      }
    } catch (error) {
      _this.logger.log({
        level: "error",
        message: error.message
      });
    }
    return lessSpecifics;
  });
  _defineProperty(this, "getMonitoredMoreSpecifics", function () {
    throw new Error("The method getMonitoredMoreSpecifics MUST be implemented");
  });
  _defineProperty(this, "getMonitoredPrefixes", function () {
    throw new Error("The method getMonitoredPrefixes MUST be implemented");
  });
  _defineProperty(this, "_filterIgnoreMorespecifics", function (i, prefix, includeIgnoredMorespecifics) {
    return includeIgnoredMorespecifics || !i.ignoreMorespecifics || _ipSub["default"]._isEqualPrefix(i.prefix, prefix); // last piece says "or it is not a more specific"
  });
  _defineProperty(this, "getMoreSpecificMatches", function (prefix) {
    var includeIgnoredMorespecifics = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return _this.index.getMatch(prefix, false).filter(function (i) {
      return _this._filterIgnoreMorespecifics(i, prefix, includeIgnoredMorespecifics);
    }).map(function (i) {
      return _objectSpread({}, i);
    });
  });
  _defineProperty(this, "getMonitoredASns", function () {
    throw new Error("The method getMonitoredASns MUST be implemented");
  });
  _defineProperty(this, "loadPrefixes", function () {
    throw new Error("The method loadPrefixes MUST be implemented");
  });
  _defineProperty(this, "save", function (data) {
    throw new Error("The method save MUST be implemented");
  });
  _defineProperty(this, "retrieve", function () {
    throw new Error("The method retrieve MUST be implemented");
  });
  _defineProperty(this, "generate", function () {
    return _inquirer["default"].prompt([{
      type: "confirm",
      name: "continue",
      message: "The file prefixes.yml cannot be loaded. Do you want to auto-configure BGPalerter?",
      "default": true
    }]).then(function (answer) {
      if (answer["continue"]) {
        return _inquirer["default"].prompt([{
          type: "input",
          name: "asns",
          message: "Which Autonomous System(s) you want to monitor? (comma-separated, e.g., 2914,3333)",
          "default": null,
          validate: function validate(value) {
            var asns = value.split(",").filter(function (i) {
              return i !== "" && !isNaN(i);
            });
            return asns.length > 0;
          }
        }, {
          type: "confirm",
          name: "m",
          message: "Do you want to be notified when your AS is announcing a new prefix?",
          "default": true
        }, {
          type: "confirm",
          name: "upstreams",
          message: "Do you want to be notified when a new upstream AS appears in a BGP path?",
          "default": true
        }, {
          type: "confirm",
          name: "downstreams",
          message: "Do you want to be notified when a new downstream AS appears in a BGP path?",
          "default": true
        }]).then(function (answer) {
          var asns = answer.asns.split(",");
          var inputParameters = {
            asnList: asns,
            exclude: [],
            excludeDelegated: true,
            prefixes: null,
            monitoredASes: answer.m ? asns : [],
            httpProxy: _this.config.httpProxy || null,
            debug: false,
            historical: false,
            group: null,
            append: false,
            logger: null,
            upstreams: !!answer.upstreams,
            downstreams: !!answer.downstreams,
            getCurrentPrefixesList: function getCurrentPrefixesList() {
              return _this.retrieve();
            }
          };
          return (0, _generatePrefixesList["default"])(inputParameters);
        });
      } else {
        throw new Error("Nothing to monitor.");
      }
    }).then(_this.save).then(function () {
      console.log("Done!");
    })["catch"](function (error) {
      console.log(error);
      _this.logger.log({
        level: "error",
        message: error
      });
      process.exit();
    });
  });
  _defineProperty(this, "_reGeneratePrefixList", function () {
    _this.logger.log({
      level: "info",
      message: "Updating prefix list"
    });
    _this.setReGeneratePrefixList();
    return _this.retrieve().then(function (oldPrefixList) {
      var inputParameters = oldPrefixList.options.generate;
      if (!inputParameters) {
        throw new Error("The prefix list cannot be refreshed because it was not generated automatically.");
      }
      inputParameters.httpProxy = _this.config.httpProxy || null;
      inputParameters.logger = function (message) {
        // Nothing, ignore logs in this case (too many otherwise)
      };
      return (0, _generatePrefixesList["default"])(inputParameters).then(function (newPrefixList) {
        newPrefixList.options.monitorASns = oldPrefixList.options.monitorASns;
        if (Object.keys(newPrefixList).length <= Object.keys(oldPrefixList).length / 100 * _this.prefixListDiffFailThreshold) {
          throw new Error("Prefix list generation failed.");
        }
        var newPrefixesNotMergeable = [];
        var uniquePrefixes = _toConsumableArray(new Set(Object.keys(oldPrefixList).concat(Object.keys(newPrefixList)))).filter(function (prefix) {
          return _ipSub["default"].isValidPrefix(prefix);
        });
        var asns = _toConsumableArray(new Set(Object.values(oldPrefixList).map(function (i) {
          return i.asn;
        }).concat(Object.keys((oldPrefixList.options || {}).monitorASns || {}))));
        var _iterator5 = _createForOfIteratorHelper(uniquePrefixes),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var prefix = _step5.value;
            var oldPrefix = oldPrefixList[prefix];
            var newPrefix = newPrefixList[prefix];

            // Apply old description to the prefix
            if (newPrefix && oldPrefix) {
              newPrefixList[prefix] = oldPrefix;
            }

            // The prefix didn't exist
            if (newPrefix && !oldPrefix) {
              // The prefix is not RPKI valid
              if (!newPrefix.valid) {
                // The prefix is not announced by a monitored ASn
                if (!newPrefix.asn.some(function (p) {
                  return asns.includes(p);
                })) {
                  newPrefixesNotMergeable.push(prefix);
                  delete newPrefixList[prefix];
                }
              }
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
        if (newPrefixesNotMergeable.length) {
          _this.logger.log({
            level: "info",
            message: "The rules about ".concat(newPrefixesNotMergeable.join(", "), " cannot be automatically added to the prefix list since their origin cannot be validated. They are not RPKI valid and they are not announced by a monitored AS. Add the prefixes manually if you want to start monitoring them.")
          });
        }
        return newPrefixList;
      });
    }).then(_this.save).then(function () {
      _this.logger.log({
        level: "info",
        message: "Prefix list updated."
      });
    })["catch"](function (error) {
      _this.logger.log({
        level: "error",
        message: error
      });
    });
  });
  _defineProperty(this, "setReGeneratePrefixList", function () {
    if (_this.config.generatePrefixListEveryDays >= 1) {
      var refreshTimer = Math.ceil(_this.config.generatePrefixListEveryDays) * 24 * 3600 * 1000;
      if (_this.regeneratePrefixListTimer) {
        clearTimeout(_this.regeneratePrefixListTimer);
      }
      _this.regeneratePrefixListTimer = setTimeout(_this._reGeneratePrefixList, refreshTimer);
    }
  });
  this.prefixes = [];
  this.asns = [];
  this.config = env.config;
  this.storage = env.storage;
  this.logger = env.logger;
  this.callbacks = [];
  this.prefixListDiffFailThreshold = 50;
  this.index = new _longestPrefixMatch["default"]();

  // This is to load the prefixes after the application is booted
  setTimeout(function () {
    _this.loadPrefixes().then(function () {
      return _this._change();
    })["catch"](function (error) {
      _this.logger.log({
        level: "error",
        message: error
      });
      console.log(error);
      process.exit();
    });
  }, 200);
});