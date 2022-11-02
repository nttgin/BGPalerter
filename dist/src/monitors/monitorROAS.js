"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MonitorROAS = /*#__PURE__*/function (_Monitor) {
  _inherits(MonitorROAS, _Monitor);

  var _super = _createSuper(MonitorROAS);

  function MonitorROAS(name, channel, params, env, input) {
    var _params$enableAdvance, _params$diffEverySeco;

    var _this;

    _classCallCheck(this, MonitorROAS);

    _this = _super.call(this, name, channel, params, env, input);

    _defineProperty(_assertThisInitialized(_this), "_calculateSizes", function (vrps) {
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

    _defineProperty(_assertThisInitialized(_this), "_checkDeletedRoasTAs", function (vrps) {
      var sizes = _this._calculateSizes(vrps);

      var metadata = _this.rpki.getMetadata();

      for (var ta in sizes) {
        if (_this.timesDeletedTAs[ta]) {
          var oldSize = _this.timesDeletedTAs[ta];
          var newSize = sizes[ta];

          if (oldSize > newSize) {
            var min = Math.min(newSize, oldSize);
            var max = Math.max(newSize, oldSize);

            var _diff = max - min;

            var percentage = 100 / max * _diff;

            if (percentage > _this.toleranceDeletedRoasTA) {
              var message = "Possible TA malfunction or incomplete VRP file: ".concat(percentage.toFixed(2), "% of the ROAs disappeared from ").concat(ta);

              _this.publishAlert("disappeared-".concat(ta), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
              ta, {
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

    _defineProperty(_assertThisInitialized(_this), "_checkExpirationTAs", function (vrps, expiringVrps, index) {
      var sizes = _this._calculateSizes(vrps);

      var expiringSizes = _this._calculateSizes(expiringVrps);

      var _loop = function _loop(ta) {
        var min = expiringSizes[ta];
        var max = sizes[ta];
        var percentage = 100 / max * min;

        if (percentage > _this.toleranceExpiredRoasTA) {
          var currentTaVrps = vrps.filter(function (i) {
            return i.ta === ta;
          });

          var extra = _this._getExpiringItems(currentTaVrps, index);

          var metadata = _this.rpki.getMetadata();

          var message = "Possible TA malfunction or incomplete VRP file: ".concat(percentage.toFixed(2), "% of the ROAs are expiring in ").concat(ta);

          _this.publishAlert("expiring-".concat(ta), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
          ta, {
            group: "default"
          }, message, _objectSpread(_objectSpread({}, extra), {}, {
            subType: "ta-expire",
            rpkiMetadata: metadata,
            expiredPercentage: percentage,
            ta: ta,
            vrpCount: sizes[ta],
            expiringVrps: expiringSizes[ta]
          }));
        }
      };

      for (var ta in sizes) {
        _loop(ta);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_verifyExpiration", function (index, roaExpirationAlertHours) {
      var roas = _this.rpki.getVRPs();

      var metadata = _this.rpki.getMetadata();

      var expiringRoas = roas.filter(function (i) {
        return !!i.expires && i.expires - _moment["default"].utc().unix() < roaExpirationAlertHours * 3600;
      });

      if (_this.enableExpirationCheckTA) {
        _this._checkExpirationTAs(roas, expiringRoas, index); // Check for TA malfunctions

      }

      if (_this.enableExpirationAlerts) {
        var prefixesIn = _this.monitored.prefixes.map(function (i) {
          return i.prefix;
        });

        var asnsIn = _this.monitored.asns.map(function (i) {
          return i.asn.getValue();
        });

        var relevantVrps = (0, _rpkiDiffingTool.getRelevant)(expiringRoas, prefixesIn, asnsIn);
        var alerts = [];

        if (relevantVrps.length) {
          if (!_this.checkOnlyASns) {
            alerts = _this._checkExpirationPrefixes(relevantVrps, metadata, index, roaExpirationAlertHours);
          }

          var _iterator2 = _createForOfIteratorHelper(asnsIn),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var asn = _step2.value;

              _this._checkExpirationAs(relevantVrps, asn, alerts, metadata, index, roaExpirationAlertHours);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_getExpiringItems", function (vrps, index) {
      if (index) {
        var uniqItems = {};

        var _iterator3 = _createForOfIteratorHelper(vrps.slice(0, 40)),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var vrp = _step3.value;

            if (vrp && vrp !== null && vrp !== void 0 && vrp.expires) {
              var expiring = _this.rpki.getExpiringElements(index, vrp, vrp === null || vrp === void 0 ? void 0 : vrp.expires);

              var _iterator4 = _createForOfIteratorHelper(expiring),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var item = _step4.value;
                  uniqItems[item.hash_id] = item;
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        var items = Object.values(uniqItems);
        return {
          type: items.every(function (i) {
            return i.type === "roa";
          }) ? "roa" : "chain",
          expiring: items.map(function (i) {
            return i.file;
          })
        };
      } else {
        return {};
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_checkExpirationPrefixes", function (vrps, metadata, index, roaExpirationAlertHours) {
      var alerts = [];

      var _loop2 = function _loop2() {
        var prefix = _arr[_i];
        var roas = vrps.filter(function (i) {
          return _ipSub["default"].isEqualPrefix(i.prefix, prefix);
        }); // Get only the ROAs for this prefix

        var matchedRule = _this.getMoreSpecificMatch(prefix, false); // Get the matching rule


        if (matchedRule) {
          var extra = _this._getExpiringItems(roas, index);

          var alertsStrings = _toConsumableArray(new Set(roas.map(_this._roaToString)));

          var message = "";

          if (extra && extra.type === "chain") {
            message = "The following ROAs will become invalid in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "), ".");
            message += " The reason is the expiration of the following parent components: ".concat(extra.expiring.join(", "));
          } else {
            message = "The following ROAs will expire in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "));
          }

          alerts = alerts.concat(alertsStrings);

          _this.publishAlert((0, _md["default"])(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
          matchedRule.prefix, matchedRule, message, _objectSpread(_objectSpread({}, extra), {}, {
            vrps: vrps,
            roaExpirationHours: roaExpirationAlertHours,
            rpkiMetadata: metadata,
            subType: "roa-expire"
          }));
        }
      };

      for (var _i = 0, _arr = _toConsumableArray(new Set(vrps.map(function (i) {
        return i.prefix;
      }))); _i < _arr.length; _i++) {
        _loop2();
      }

      return alerts;
    });

    _defineProperty(_assertThisInitialized(_this), "_checkExpirationAs", function (vrps, asn, sent, metadata, index, roaExpirationAlertHours) {
      try {
        var alerts = [];

        var impactedASes = _toConsumableArray(new Set(vrps.map(function (i) {
          return i.asn;
        })));

        var matchedRules = impactedASes.map(function (asn) {
          return _this.getMonitoredAsMatch(new _model.AS(asn));
        });

        var _iterator5 = _createForOfIteratorHelper(matchedRules.filter(function (i) {
          return !!i;
        })),
            _step5;

        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var matchedRule = _step5.value;
            // An alert for each AS involved (they may have different user group)
            var unsentVrps = vrps.filter(function (i) {
              return !sent.includes(_this._roaToString(i));
            });

            var alertsStrings = _toConsumableArray(new Set(unsentVrps.map(_this._roaToString)));

            if (alertsStrings.length) {
              var extra = _this._getExpiringItems(vrps, index);

              var message = "";

              if (extra && extra.type === "chain") {
                message = "The following ROAs will become invalid in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "), ".");
                message += " The reason is the expiration of the following parent components: ".concat(extra.expiring.join(", "));
              } else {
                message = "The following ROAs will expire in less than ".concat(roaExpirationAlertHours, " hours: ").concat(alertsStrings.join("; "));
              }

              alerts = alerts.concat(alertsStrings);

              _this.publishAlert((0, _md["default"])(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
              matchedRule.asn.getId(), matchedRule, message, _objectSpread(_objectSpread({}, extra), {}, {
                vrps: unsentVrps,
                roaExpirationHours: roaExpirationAlertHours,
                rpkiMetadata: metadata,
                subType: "roa-expire"
              }));
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }

        return alerts;
      } catch (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_diffVrps", function () {
      var newVrps = _this.rpki.getVRPs(); // Get all the vrps as retrieved from the rpki validator


      if (_this.enableDeletedCheckTA) {
        _this._checkDeletedRoasTAs(newVrps); // Check for TA malfunctions for too many deleted roas

      }

      if (_this.enableDiffAlerts) {
        if (_this._oldVrps) {
          // No diff if there were no vrps before
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

          var _iterator6 = _createForOfIteratorHelper(asns),
              _step6;

          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var asn = _step6.value;

              _this._diffVrpsAs(_this._oldVrps, newVrps, asn, alerts);
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
        }

        if (newVrps.length) {
          _this._oldVrps = newVrps;
        }
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_diffVrpsPrefixes", function (oldVrps, newVrps, prefixesIn) {
      try {
        var roaDiff = (0, _rpkiDiffingTool.diff)(oldVrps, newVrps, [], prefixesIn);
        var alerts = [];

        if (roaDiff && roaDiff.length) {
          var _loop3 = function _loop3() {
            var prefix = _arr2[_i2];
            var roas = roaDiff.filter(function (i) {
              return _ipSub["default"].isEqualPrefix(i.prefix, prefix);
            }); // Get only the ROAs for this prefix

            var matchedRule = _this.getMoreSpecificMatch(prefix, false); // Get the matching rule


            if (matchedRule) {
              var alertsStrings = _toConsumableArray(new Set(roas.map(_this._roaToString)));

              var message = alertsStrings.length <= 10 ? "ROAs change detected: ".concat(alertsStrings.join("; ")) : "ROAs change detected: ".concat(alertsStrings.slice(0, 10).join("; "), " and more...");
              alerts = alerts.concat(alertsStrings);

              _this.publishAlert((0, _md["default"])(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
              matchedRule.prefix, matchedRule, message, {
                diff: alertsStrings,
                subType: "roa-diff"
              });
            }
          };

          // Differences found
          for (var _i2 = 0, _arr2 = _toConsumableArray(new Set(roaDiff.map(function (i) {
            return i.prefix;
          }))); _i2 < _arr2.length; _i2++) {
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

    _defineProperty(_assertThisInitialized(_this), "_diffVrpsAs", function (oldVrps, newVrps, asn, sent) {
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

          var _iterator7 = _createForOfIteratorHelper(matchedRules.filter(function (i) {
            return !!i;
          })),
              _step7;

          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var matchedRule = _step7.value;

              // An alert for each AS involved (they may have different user group)
              var alertsStrings = _toConsumableArray(new Set(roaDiff.map(_this._roaToString))).filter(function (i) {
                return !sent.includes(i);
              });

              if (alertsStrings.length) {
                var message = alertsStrings.length <= 10 ? "ROAs change detected: ".concat(alertsStrings.join("; ")) : "ROAs change detected: ".concat(alertsStrings.slice(0, 10).join("; "), " and more...");
                alerts = alerts.concat(alertsStrings);

                _this.publishAlert((0, _md["default"])(message), // The hash will prevent alert duplications in case multiple ASes/prefixes are involved
                matchedRule.asn.getId(), matchedRule, message, {
                  diff: alertsStrings,
                  subType: "roa-diff"
                });
              }
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
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

    _defineProperty(_assertThisInitialized(_this), "_roaToString", function (roa) {
      if (roa.status) {
        return "".concat(roa.status, " <").concat(roa.prefix, ", ").concat(roa.asn, ", ").concat(roa.maxLength, ", ").concat(roa.ta || "", ">");
      } else {
        return "<".concat(roa.prefix, ", ").concat(roa.asn, ", ").concat(roa.maxLength, ", ").concat(roa.ta || "", ">");
      }
    });

    _defineProperty(_assertThisInitialized(_this), "updateMonitoredResources", function () {
      _this.monitored = {
        asns: _this.input.getMonitoredASns(),
        prefixes: _this.input.getMonitoredPrefixes()
      };
    });

    _defineProperty(_assertThisInitialized(_this), "filter", function (message) {
      return false;
    });

    _defineProperty(_assertThisInitialized(_this), "squashAlerts", function (alerts) {
      return alerts[0] ? alerts[0].matchedMessage : false;
    });

    _defineProperty(_assertThisInitialized(_this), "monitor", function (message) {
      return Promise.resolve(true);
    });

    _this.logger = env.logger;
    _this.rpki = env.rpki; // Enabled checks

    _this.enableDiffAlerts = params.enableDiffAlerts != null ? params.enableDiffAlerts : true;
    _this.enableExpirationAlerts = params.enableExpirationAlerts != null ? params.enableExpirationAlerts : true;
    _this.enableExpirationCheckTA = params.enableExpirationCheckTA != null ? params.enableExpirationCheckTA : true;
    _this.enableDeletedCheckTA = params.enableDeletedCheckTA != null ? params.enableDeletedCheckTA : true;
    _this.enableAdvancedRpkiStats = (_params$enableAdvance = params.enableAdvancedRpkiStats) !== null && _params$enableAdvance !== void 0 ? _params$enableAdvance : true;
    _this.diffEverySeconds = (_params$diffEverySeco = params.diffEverySeconds) !== null && _params$diffEverySeco !== void 0 ? _params$diffEverySeco : 30; // Default parameters

    _this.roaExpirationAlertHours = params.roaExpirationAlertHours || 2;
    _this.checkOnlyASns = params.checkOnlyASns != null ? params.checkOnlyASns : true;
    _this.toleranceExpiredRoasTA = params.toleranceExpiredRoasTA || 20;
    _this.toleranceDeletedRoasTA = params.toleranceDeletedRoasTA || 20;
    _this.timesDeletedTAs = {};
    _this.seenTAs = {};
    _this.monitored = {
      asns: [],
      prefixes: []
    };

    if (_this.enableDiffAlerts || _this.enableDeletedCheckTA) {
      setInterval(_this._diffVrps, _this.diffEverySeconds * 1000);
    }

    if (_this.enableExpirationAlerts || _this.enableExpirationCheckTA) {
      setInterval(function () {
        if (_this.enableAdvancedRpkiStats) {
          _this.rpki._getVrpIndex().then(function (index) {
            _this._verifyExpiration(index, _this.roaExpirationAlertHours); // Verify expiration with enrichment

          })["catch"](function (error) {
            _this.logger.log({
              level: 'error',
              message: error
            });

            _this._verifyExpiration(null, _this.roaExpirationAlertHours); // Verify expiration without enrichment

          });
        } else {
          _this._verifyExpiration(null, _this.roaExpirationAlertHours); // Verify expiration without enrichment

        }
      }, global.EXTERNAL_ROA_EXPIRATION_TEST || 600000);
    }

    return _this;
  }

  return _createClass(MonitorROAS);
}(_monitor["default"]);

exports["default"] = MonitorROAS;