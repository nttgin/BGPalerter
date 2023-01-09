"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _rpkiValidator = _interopRequireDefault(require("rpki-validator"));
var _fs = _interopRequireDefault(require("fs"));
var _md = _interopRequireDefault(require("md5"));
var _axiosEnrich = _interopRequireDefault(require("./axiosEnrich"));
var _axios = _interopRequireDefault(require("axios"));
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var RpkiUtils = /*#__PURE__*/_createClass(function RpkiUtils(env) {
  var _this = this;
  _classCallCheck(this, RpkiUtils);
  _defineProperty(this, "_loadRpkiValidatorFromVrpProvider", function () {
    if (!_this.rpki) {
      var rpkiValidatorOptions = {
        connector: _this.params.vrpProvider,
        clientId: _this.clientId,
        axios: (0, _axiosEnrich["default"])(_axios["default"], !_this.params.noProxy && _this.agent ? _this.agent : null, _this.userAgent)
      };
      if (_this.params.url) {
        rpkiValidatorOptions.url = _this.params.url;
      }
      _this.rpki = new _rpkiValidator["default"](rpkiValidatorOptions);
      if (_this.params.preCacheROAs) {
        _this._preCache();
      }
    }
  });
  _defineProperty(this, "_watchVrpFile", function (vrpFile) {
    var reload = function reload() {
      // Watch the external file to refresh the list
      if (_this.watchFileTimer) {
        clearTimeout(_this.watchFileTimer);
      }
      _this.watchFileTimer = setTimeout(function () {
        _this.logger.log({
          level: 'info',
          message: "VRPs reloaded due to file change."
        });
        _this._loadRpkiValidatorFromVrpFile(vrpFile);
      }, 3000);
    };
    _fs["default"].watchFile(vrpFile, reload);
  });
  _defineProperty(this, "_loadRpkiValidatorFromVrpFile", function (vrpFile) {
    if (_fs["default"].existsSync(vrpFile)) {
      try {
        var vrps = JSON.parse(_fs["default"].readFileSync(vrpFile, 'utf8'));
        if (vrps) {
          if (vrps.roas && vrps.roas.length) {
            vrps = vrps.roas;
          }
          if (vrps.length > 0) {
            if (_this.rpki) {
              _this.rpki.empty();
            } else {
              _this.rpki = new _rpkiValidator["default"]({
                connector: "external",
                clientId: _this.clientId
              });
            }
            _this.rpki.setVRPs(vrps);
            _this._preCache();
          } else {
            _this.logger.log({
              level: 'error',
              message: "The provided VRPs file is empty. Using default vrpProvider."
            });
          }
        }
      } catch (error) {
        _this.logger.log({
          level: 'error',
          message: "The provided VRPs file cannot be parsed. Using default vrpProvider."
        });
      }
    } else {
      _this.logger.log({
        level: 'error',
        message: "The provided VRPs file cannot be found. Using default vrpProvider."
      });
    }
    return _this._loadRpkiValidatorFromVrpProvider();
  });
  _defineProperty(this, "_loadRpkiValidator", function () {
    if (!!_this.params.vrpFile) {
      var vrpFile = _this.config.volume + _this.params.vrpFile;
      _this._loadRpkiValidatorFromVrpFile(vrpFile);
      _this._watchVrpFile(vrpFile);
    } else {
      _this._loadRpkiValidatorFromVrpProvider();
    }
  });
  _defineProperty(this, "_preCache", function () {
    if (!!_this.params.preCacheROAs) {
      return _this.rpki.preCache(_this.params.refreshVrpListMinutes).then(function (data) {
        _this.status.data = true;
        _this.status.stale = false;
        return data;
      })["catch"](function () {
        if (!_this._cannotDownloadErrorOnce) {
          _this.logger.log({
            level: 'error',
            message: "The VRP list cannot be downloaded. The RPKI monitoring should be working anyway with one of the on-line providers."
          });
        }
        _this._cannotDownloadErrorOnce = true;
      });
    } else {
      _this.status.data = true;
      _this.status.stale = false;
      return Promise.resolve();
    }
  });
  _defineProperty(this, "_validateQueue", function () {
    var batch = {};
    var _iterator = _createForOfIteratorHelper(_this.queue),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _step.value,
          message = _step$value.message,
          matchedRule = _step$value.matchedRule,
          callback = _step$value.callback;
        var key = message.originAS.getId() + "-" + message.prefix;
        batch[key] = batch[key] || [];
        batch[key].push({
          message: message,
          matchedRule: matchedRule,
          callback: callback
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    _this.queue = [];
    _this.validateBatch(Object.values(batch).map(function (elements) {
      var message = elements[0].message;
      return {
        prefix: message.prefix,
        origin: message.originAS
      };
    })).then(function (results) {
      var _iterator2 = _createForOfIteratorHelper(results),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var result = _step2.value;
          var key = result.origin.getId() + "-" + result.prefix;
          var _iterator3 = _createForOfIteratorHelper(batch[key]),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var _step3$value = _step3.value,
                message = _step3$value.message,
                matchedRule = _step3$value.matchedRule,
                callback = _step3$value.callback;
              callback(result, message, matchedRule);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    })["catch"](function (error) {
      _this.logger.log({
        level: 'error',
        message: error
      });
    });
  });
  _defineProperty(this, "addToValidationQueue", function (message, matchedRule, callback) {
    _this.queue.push({
      message: message,
      matchedRule: matchedRule,
      callback: callback
    });
  });
  _defineProperty(this, "validate", function (prefix, origin) {
    return _this.validateBatch([{
      prefix: prefix,
      origin: origin
    }]).then(function (results) {
      return results[0];
    });
  });
  _defineProperty(this, "validateBatch", function (batch) {
    return _this._preCache().then(function () {
      return Promise.all(batch.map(function (_ref) {
        var prefix = _ref.prefix,
          origin = _ref.origin;
        var origins = [].concat.apply([], [origin.getValue()]);
        return Promise.all(origins.map(function (asn) {
          return _this.rpki.validate(prefix, asn, true);
        })) // Validate each origin
        .then(function (results) {
          if (results.length === 1) {
            // Only one result = only one origin, just return
            return _objectSpread(_objectSpread({}, results[0]), {}, {
              prefix: prefix,
              origin: origin
            });
          } else {
            // Multiple origin
            if (results.every(function (result) {
              return result && result.valid;
            })) {
              // All valid
              return {
                valid: true,
                covering: [].concat.apply([], results.map(function (i) {
                  return i.covering;
                })),
                prefix: prefix,
                origin: origin
              };
            } else if (results.some(function (result) {
              return result && !result.valid;
            })) {
              // At least one not valid
              return {
                valid: false,
                covering: [].concat.apply([], results.map(function (i) {
                  return i.covering;
                })),
                prefix: prefix,
                origin: origin
              };
            } else {
              // return not covered
              return {
                valid: null,
                covering: [].concat.apply([], results.map(function (i) {
                  return i.covering;
                })),
                prefix: prefix,
                origin: origin
              };
            }
          }
        });
      }))["catch"](function (error) {
        _this.logger.log({
          level: 'error',
          message: "RPKI validation failed due to:" + error
        });
      });
    });
  });
  _defineProperty(this, "getVRPs", function () {
    return _this.rpki.toArray();
  });
  _defineProperty(this, "getMetadata", function () {
    return _this.rpki.getMetadata();
  });
  _defineProperty(this, "getStatus", function () {
    return _this.status;
  });
  _defineProperty(this, "_markAsStale", function () {
    if (!!_this.params.preCacheROAs) {
      var digest = (0, _md["default"])(JSON.stringify(_this.getVRPs()));
      if (_this.oldDigest) {
        _this.status.stale = _this.oldDigest === digest;
      }
      _this.oldDigest = digest;
    }
  });
  _defineProperty(this, "getExpiringElements", function (index, vrp, expires) {
    return index.getExpiring(vrp, expires, _moment["default"].utc().unix());
  });
  _defineProperty(this, "_getVrpIndex", function () {
    var _this$rpki;
    if ((_this$rpki = _this.rpki) !== null && _this$rpki !== void 0 && _this$rpki.getAdvancedStats) {
      return _this.rpki.getAdvancedStats();
    } else {
      return Promise.resolve(null);
    }
  });
  this.config = env.config;
  this.agent = env.agent;
  this.params = this.config.rpki || {};
  this.clientId = env.clientId || "";
  this.logger = env.logger;
  this.userAgent = "".concat(this.clientId, "/").concat(env.version);
  var defaultMarkDataAsStaleAfterMinutes = 60;
  var providers = [].concat(_toConsumableArray(_rpkiValidator["default"].providers), ["api"]);
  if (this.params.url || this.params.vrpProvider === "api") {
    this.params.vrpProvider = "api";
    this.params.preCacheROAs = true;
    if (!this.params.url) {
      this.params.vrpProvider = providers[0];
      this.params.url = null;
      this.logger.log({
        level: 'error',
        message: "No url provided for the vrps api. Using default vrpProvider."
      });
    }
  }
  if (this.params.vrpFile) {
    this.params.vrpProvider = "external";
    this.params.refreshVrpListMinutes = null;
    this.params.preCacheROAs = true;
  } else {
    var _this$params$preCache;
    if (!this.params.vrpProvider) {
      this.params.vrpProvider = providers[0];
    } else if (!providers.includes(this.params.vrpProvider)) {
      this.params.vrpProvider = providers[0];
      this.logger.log({
        level: 'error',
        message: "The specified vrpProvider is not valid. Using default vrpProvider."
      });
    }
    this.params.refreshVrpListMinutes = Math.max(this.params.refreshVrpListMinutes || 0, 5);
    this.params.preCacheROAs = !!((_this$params$preCache = this.params.preCacheROAs) !== null && _this$params$preCache !== void 0 ? _this$params$preCache : true);
  }
  if (this.params.markDataAsStaleAfterMinutes !== undefined) {
    if (this.params.markDataAsStaleAfterMinutes <= this.params.refreshVrpListMinutes) {
      this.logger.log({
        level: 'error',
        message: "The specified markDataAsStaleAfterMinutes cannot be <= of refreshVrpListMinutes (".concat(defaultMarkDataAsStaleAfterMinutes, " minutes will be used).")
      });
      this.params.markDataAsStaleAfterMinutes = defaultMarkDataAsStaleAfterMinutes;
    }
  }
  this.status = {
    data: true,
    stale: false,
    provider: this.params.vrpProvider
  };
  this._loadRpkiValidator();
  if (this.params.markDataAsStaleAfterMinutes > 0) {
    setInterval(this._markAsStale, this.params.markDataAsStaleAfterMinutes * 60 * 1000);
  }
  this.queue = [];
  setInterval(this._validateQueue, 500); // Periodically validate prefixes-origin pairs
});
exports["default"] = RpkiUtils;