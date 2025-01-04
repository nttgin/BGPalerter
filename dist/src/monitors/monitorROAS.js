"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _monitor = _interopRequireDefault(require("./monitor"));
var _md = _interopRequireDefault(require("md5"));
var _rpkiDiffingTool = require("../utils/rpkiDiffingTool");
var _model = require("../model");
var _moment = _interopRequireDefault(require("moment"));
var _ipSub = _interopRequireDefault(require("ip-sub"));
var _batchPromises = _interopRequireDefault(require("batch-promises"));
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
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var getTaToleranceDict = function getTaToleranceDict(tolerance) {
  if (typeof tolerance === "number") {
    return {
      ripe: tolerance,
      apnic: tolerance,
      arin: tolerance,
      lacnic: tolerance,
      afrinic: tolerance
    };
  }
  return tolerance;
};
var MonitorROAS = exports["default"] = /*#__PURE__*/function (_Monitor) {
  function MonitorROAS(name, channel, params, env, input) {
    var _params$enableDiffAle, _params$enableExpirat, _params$enableExpirat2, _params$enableDeleted, _params$enableAdvance;
    var _this;
    _classCallCheck(this, MonitorROAS);
    _this = _callSuper(this, MonitorROAS, [name, channel, params, env, input]);
    _defineProperty(_this, "_enablePeriodicCheck", function (condition, checkFunction, seconds) {
      if (condition) {
        if (!global.EXTERNAL_ROA_EXPIRATION_TEST) {
          setTimeout(function () {
            return _this._skipIfStaleVrps(checkFunction);
          }, 30 * 1000); // Initial run
        }
        setInterval(function () {
          return _this._skipIfStaleVrps(checkFunction);
        }, global.EXTERNAL_ROA_EXPIRATION_TEST || seconds * 1000); // Periodic run
      }
    });
    _defineProperty(_this, "_skipIfStaleVrps", function (callback) {
      if (!_this.rpki.getStatus().stale) {
        callback();
      }
    });
    _defineProperty(_this, "_calculateSizes", function (vrps) {
      var times = {};
      for (var ta in _this.seenTAs) {
        times[ta] = 0;
      }
      var _iterator = _createForOfIteratorHelper(vrps),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var vrp = _step.value;
          times[vrp.ta] = times[vrp.ta] || 0;
          times[vrp.ta]++;
          _this.seenTAs[vrp.ta] = true;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return times;
    });
    _defineProperty(_this, "_checkDeletedRoasTAs", function () {
      var vrps = _this.rpki.getVRPs(); // Get all the vrps as retrieved from the rpki validator
      var sizes = _this._calculateSizes(vrps);
      var metadata = _this.rpki.getMetadata();
      _this.logger.log({
        level: 'info',
        message: "Performing TA deletion check"
      });
      for (var ta in sizes) {
        if (_this.timesDeletedTAs[ta]) {
          var oldSize = _this.timesDeletedTAs[ta];
          var newSize = sizes[ta];
          if (oldSize > newSize) {
            var min = Math.min(newSize, oldSize);
            var max = Math.max(newSize, oldSize);
            var _diff = max - min;
            var percentage = 100 / max * _diff;
            if (percentage > _this.toleranceDeletedRoasTA[ta]) {
              var message = "Possible TA malfunction or incomplete VRP file: ".concat(percentage.toFixed(2), "% of the ROAs disappeared from ").concat(ta);
              _this.publishAlert("disappeared-".concat(ta), ta, {
                group: "default"
              }, message, {
                rpkiMetadata: metadata,
                subType: "ta-malfunction",
                vrpCountBefore: oldSize,
                vrpCountAfter: newSize,
                disappearedPercentage: percentage,
                ta: ta
              });
            }
          }
        }
      }
      _this.timesDeletedTAs = sizes;
    });
    _defineProperty(_this, "_checkExpirationTAs", function () {
      var roaExpirationAlertHours = _this.roaExpirationAlertHours;
      var vrps = _this.rpki.getVRPs();
      var expiringVrps = vrps.filter(function (i) {
        return !!i.expires && i.expires - _moment["default"].utc().unix() < roaExpirationAlertHours * 3600;
      });
      var sizes = _this._calculateSizes(vrps);
      var expiringSizes = _this._calculateSizes(expiringVrps);
      _this.logger.log({
        level: 'info',
        message: "Performing TA expiration check"
      });
      var _loop = function _loop(ta) {
        var min = expiringSizes[ta];
        var max = sizes[ta];
        var percentage = 100 / max * min;
        if (percentage > _this.toleranceExpiredRoasTA[ta]) {
          var currentTaVrps = vrps.filter(function (i) {
            return i.ta === ta;
          });
          _this._getExpiringItems(currentTaVrps).then(function (extra) {
            var metadata = _this.rpki.getMetadata();
            var message = "Possible TA malfunction or incomplete VRP file: ".concat(percentage.toFixed(2), "% of the ROAs are expiring in ").concat(ta);
            _this.publishAlert("expiring-".concat(ta), ta, {
              group: "default"
            }, message, _objectSpread(_objectSpread({}, extra), {}, {
              subType: "ta-expire",
              rpkiMetadata: metadata,
              expiredPercentage: percentage,
              ta: ta,
              vrpCount: sizes[ta],
              expiringVrps: expiringSizes[ta]
            }));
          })["catch"](function (error) {
            _this.logger.log({
              level: 'error',
              message: error
            });
          });
        }
      };
      for (var ta in sizes) {
        _loop(ta);
      }
    });
    _defineProperty(_this, "_verifyExpiration", function () {
      var roaExpirationAlertHours = _this.roaExpirationAlertHours;
      var roas = _this.rpki.getVRPs();
      var metadata = _this.rpki.getMetadata();
      var expiringRoas = roas.filter(function (i) {
        return !!i.expires && i.expires - _moment["default"].utc().unix() < roaExpirationAlertHours * 3600;
      });
      if (_this.enableExpirationAlerts) {
        _this.logger.log({
          level: 'info',
          message: "Performing expiration check on VRPs"
        });
        var prefixesIn = _this.monitored.prefixes.map(function (i) {
          return i.prefix;
        });
        var asnsIn = _this.monitored.asns.map(function (i) {
          return i.asn.getValue();
        });
        var relevantVrps = (0, _rpkiDiffingTool.getRelevant)(expiringRoas, prefixesIn, asnsIn);
        if (relevantVrps.length) {
          return (_this.checkOnlyASns ? Promise.resolve([]) : _this._checkExpirationPrefixes(relevantVrps, metadata, roaExpirationAlertHours)).then(function (alerts) {
            return (0, _batchPromises["default"])(1, asnsIn, function (asn) {
              return _this._checkExpirationAs(relevantVrps, asn, alerts, metadata, roaExpirationAlertHours);
            });
          });
        }
      }
    });
    _defineProperty(_this, "_getExpiringItems", function (vrps) {
      if (_this.enableAdvancedRpkiStats) {
        var uniqItems = {};
        var items = vrps.slice(0, 40).filter(function (vrp) {
          return vrp && (vrp === null || vrp === void 0 ? void 0 : vrp.expires);
        });
        return (0, _batchPromises["default"])(1, items, function (vrp) {
          return _this.rpki.getExpiringElements(vrp, vrp === null || vrp === void 0 ? void 0 : vrp.expires).then(function (expiring) {
            var _iterator2 = _createForOfIteratorHelper(expiring),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var item = _step2.value;
                uniqItems[item.hash_id] = item;
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          });
        }).then(function () {
          var items = Object.values(uniqItems);
          if (items.length > 0) {
            return {
              type: items.every(function (i) {
                return i.type === "roa";
              }) ? "roa" : "chain",
              expiring: items.map(function (i) {
                return i.file;
              })
            };
          } else {
            return Promise.reject("Not found yet");
          }
        });
      } else {
        return Promise.resolve({});
      }
    });
    _defineProperty(_this, "_checkExpirationPrefixes", function (vrps, metadata, roaExpirationAlertHours) {
      var alerts = [];
      return Promise.all(_toConsumableArray(new Set(vrps.map(function (i) {
        return i.prefix;
      }))).map(function (prefix) {
        var roas = vrps.filter(function (i) {
          return _ipSub["default"].isEqualPrefix(i.prefix, prefix);
        }); // Get only the ROAs for this prefix
        var matchedRules = _this.getMoreSpecificMatches(prefix, false); // Get the matching rule

        return Promise.all(matchedRules.map(function (matchedRule) {
          return _this._getExpiringItems(roas).then(function (extra) {
            var alertsStrings = _toConsumableArray(new Set(roas.map(_this._roaToString)));
            var message = "";
            if (extra && extra.type === "chain") {
              message = "The following ROAs will become invalid in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "), ".");
              message += " The reason is the expiration of the following parent components: ".concat(extra.expiring.join(", "));
            } else {
              message = "The following ROAs will expire in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "));
            }
            alerts = alerts.concat(alertsStrings);
            _this.publishAlert((0, _md["default"])(message),
            // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
            matchedRule.prefix, matchedRule, message, _objectSpread(_objectSpread({}, extra), {}, {
              vrps: vrps,
              roaExpirationHours: roaExpirationAlertHours,
              rpkiMetadata: metadata,
              subType: "roa-expire"
            }));
          })["catch"](function (error) {
            _this.logger.log({
              level: 'error',
              message: error
            });
          });
        }));
      })).then(function () {
        return alerts;
      });
    });
    _defineProperty(_this, "_checkExpirationAs", function (vrps, asn, sent, metadata, roaExpirationAlertHours) {
      try {
        var alerts = [];
        var impactedASes = _toConsumableArray(new Set(vrps.map(function (i) {
          return i.asn;
        })));
        var matchedRules = impactedASes.map(function (asn) {
          return _this.getMonitoredAsMatch(new _model.AS(asn));
        });
        var _iterator3 = _createForOfIteratorHelper(matchedRules.filter(function (i) {
            return !!i;
          })),
          _step3;
        try {
          var _loop2 = function _loop2() {
            var matchedRule = _step3.value;
            // An alert for each AS involved (they may have different user group)
            var unsentVrps = vrps.filter(function (i) {
              return !sent.includes(_this._roaToString(i));
            });
            var alertsStrings = _toConsumableArray(new Set(unsentVrps.map(_this._roaToString)));
            if (alertsStrings.length) {
              _this._getExpiringItems(vrps).then(function (extra) {
                var message = "";
                if (extra && extra.type === "chain") {
                  message = "The following ROAs will become invalid in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "), ".");
                  message += " The reason is the expiration of the following parent components: ".concat(extra.expiring.join(", "));
                } else {
                  message = "The following ROAs will expire in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "));
                }
                alerts = alerts.concat(alertsStrings);
                _this.publishAlert((0, _md["default"])(message),
                // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                matchedRule.asn.getId(), matchedRule, message, _objectSpread(_objectSpread({}, extra), {}, {
                  vrps: unsentVrps,
                  roaExpirationHours: roaExpirationAlertHours,
                  rpkiMetadata: metadata,
                  subType: "roa-expire"
                }));
              })["catch"](function (error) {
                _this.logger.log({
                  level: 'error',
                  message: error
                });
              });
            }
          };
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            _loop2();
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        return alerts;
      } catch (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      }
    });
    _defineProperty(_this, "_diffVrps", function () {
      var newVrps = _this.rpki.getVRPs(); // Get all the vrps as retrieved from the rpki validator

      if (_this.enableDiffAlerts) {
        if (_this._oldVrps) {
          // No diff if there were no vrps before

          _this.logger.log({
            level: 'info',
            message: "Performing diff on VRPs"
          });
          var prefixesIn = _this.monitored.prefixes.map(function (i) {
            return i.prefix;
          });
          var asns = _this.monitored.asns.map(function (i) {
            return i.asn.getValue();
          });
          var alerts = [];
          if (!_this.checkOnlyASns) {
            alerts = _this._diffVrpsPrefixes(_this._oldVrps, newVrps, prefixesIn);
          }
          var _iterator4 = _createForOfIteratorHelper(asns),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var asn = _step4.value;
              _this._diffVrpsAs(_this._oldVrps, newVrps, asn, alerts);
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }
        if (newVrps.length) {
          _this._oldVrps = newVrps;
        }
      }
    });
    _defineProperty(_this, "_diffVrpsPrefixes", function (oldVrps, newVrps, prefixesIn) {
      try {
        var roaDiff = (0, _rpkiDiffingTool.diff)(oldVrps, newVrps, [], prefixesIn);
        var alerts = [];
        if (roaDiff && roaDiff.length) {
          var _loop3 = function _loop3() {
            var prefix = _arr[_i];
            var roas = roaDiff.filter(function (i) {
              return _ipSub["default"].isEqualPrefix(i.prefix, prefix);
            }); // Get only the ROAs for this prefix
            var matchedRules = _this.getMoreSpecificMatches(prefix, false); // Get the matching rule
            var _iterator5 = _createForOfIteratorHelper(matchedRules),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var matchedRule = _step5.value;
                var alertsStrings = _toConsumableArray(new Set(roas.map(_this._roaToString))).sort();
                var message = alertsStrings.length <= 10 ? "ROAs change detected: ".concat(alertsStrings.join("; ")) : "ROAs change detected: ".concat(alertsStrings.slice(0, 10).join("; "), " and more...");
                alerts = alerts.concat(alertsStrings);
                var metadata = _this.rpki.getMetadata();
                _this.publishAlert((0, _md["default"])(message),
                // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                matchedRule.prefix, matchedRule, message, {
                  diff: alertsStrings,
                  subType: "roa-diff",
                  rpkiMetadata: metadata
                });
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
          };
          // Differences found
          for (var _i = 0, _arr = _toConsumableArray(new Set(roaDiff.map(function (i) {
              return i.prefix;
            }))); _i < _arr.length; _i++) {
            _loop3();
          }
        }
        return alerts;
      } catch (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      }
    });
    _defineProperty(_this, "_diffVrpsAs", function (oldVrps, newVrps, asn, sent) {
      try {
        var roaDiff = (0, _rpkiDiffingTool.diff)(oldVrps, newVrps, asn, []);
        var alerts = [];
        if (roaDiff && roaDiff.length) {
          // Differences found

          var impactedASes = _toConsumableArray(new Set(roaDiff.map(function (i) {
            return i.asn;
          })));
          var matchedRules = impactedASes.map(function (asn) {
            return _this.getMonitoredAsMatch(new _model.AS(asn));
          });
          var _iterator6 = _createForOfIteratorHelper(matchedRules.filter(function (i) {
              return !!i;
            })),
            _step6;
          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var matchedRule = _step6.value;
              // An alert for each AS involved (they may have different user group)
              var alertsStrings = _toConsumableArray(new Set(roaDiff.map(_this._roaToString))).filter(function (i) {
                return !sent.includes(i);
              });
              if (alertsStrings.length) {
                var message = alertsStrings.length <= 10 ? "ROAs change detected: ".concat(alertsStrings.join("; ")) : "ROAs change detected: ".concat(alertsStrings.slice(0, 10).join("; "), " and more...");
                alerts = alerts.concat(alertsStrings);
                var metadata = _this.rpki.getMetadata();
                _this.publishAlert((0, _md["default"])(message),
                // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                matchedRule.asn.getId(), matchedRule, message, {
                  diff: alertsStrings,
                  subType: "roa-diff",
                  rpkiMetadata: metadata
                });
              }
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
        }
        return alerts;
      } catch (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      }
    });
    _defineProperty(_this, "_roaToString", function (roa) {
      if (roa.status) {
        return "".concat(roa.status, " <").concat(roa.prefix, ", ").concat(roa.asn, ", ").concat(roa.maxLength, ", ").concat(roa.ta || "", ">");
      } else {
        return "<".concat(roa.prefix, ", ").concat(roa.asn, ", ").concat(roa.maxLength, ", ").concat(roa.ta || "", ">");
      }
    });
    _defineProperty(_this, "updateMonitoredResources", function () {
      _this.monitored = {
        asns: _this.input.getMonitoredASns(),
        prefixes: _this.input.getMonitoredPrefixes()
      };
    });
    _defineProperty(_this, "filter", function (message) {
      return false;
    });
    _defineProperty(_this, "squashAlerts", function (alerts) {
      return alerts[0] ? alerts[0].matchedMessage : false;
    });
    _defineProperty(_this, "monitor", function (message) {
      return Promise.resolve(true);
    });
    _this.logger = env.logger;
    _this.rpki = env.rpki;

    // Enabled checks
    _this.enableDiffAlerts = (_params$enableDiffAle = params.enableDiffAlerts) !== null && _params$enableDiffAle !== void 0 ? _params$enableDiffAle : true;
    _this.enableExpirationAlerts = (_params$enableExpirat = params.enableExpirationAlerts) !== null && _params$enableExpirat !== void 0 ? _params$enableExpirat : true;
    _this.enableExpirationCheckTA = (_params$enableExpirat2 = params.enableExpirationCheckTA) !== null && _params$enableExpirat2 !== void 0 ? _params$enableExpirat2 : true;
    _this.enableDeletedCheckTA = (_params$enableDeleted = params.enableDeletedCheckTA) !== null && _params$enableDeleted !== void 0 ? _params$enableDeleted : true;
    _this.diffEverySeconds = Math.max(params.diffEverySeconds || 600, 200);
    _this.checkExpirationVrpsEverySeconds = Math.max(_this.diffEverySeconds, 300);
    _this.checkTaEverySeconds = Math.max(params.checkTaEverySeconds || 15 * 60, _this.diffEverySeconds);
    _this.enableAdvancedRpkiStats = (_params$enableAdvance = params.enableAdvancedRpkiStats) !== null && _params$enableAdvance !== void 0 ? _params$enableAdvance : true;

    // Default parameters
    _this.roaExpirationAlertHours = params.roaExpirationAlertHours || 2;
    _this.checkOnlyASns = params.checkOnlyASns != null ? params.checkOnlyASns : true;
    _this.toleranceExpiredRoasTA = getTaToleranceDict(params.toleranceExpiredRoasTA || 20);
    _this.toleranceDeletedRoasTA = getTaToleranceDict(params.toleranceDeletedRoasTA || 20);
    _this.timesDeletedTAs = {};
    _this.seenTAs = {};
    _this.monitored = {
      asns: [],
      prefixes: []
    };
    _this._enablePeriodicCheck(_this.enableDiffAlerts, _this._diffVrps, _this.diffEverySeconds);
    _this._enablePeriodicCheck(_this.enableExpirationAlerts, _this._verifyExpiration, _this.checkExpirationVrpsEverySeconds);
    _this._enablePeriodicCheck(_this.enableDeletedCheckTA, _this._checkDeletedRoasTAs, _this.checkTaEverySeconds); // Check for TA malfunctions for too many deleted roas
    _this._enablePeriodicCheck(_this.enableExpirationCheckTA, _this._checkExpirationTAs, _this.checkTaEverySeconds); // Check for TA malfunctions for too many expiring roas
    return _this;
  }
  _inherits(MonitorROAS, _Monitor);
  return _createClass(MonitorROAS);
}(_monitor["default"]);