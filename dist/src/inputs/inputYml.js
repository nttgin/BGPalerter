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
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var InputYml = /*#__PURE__*/function (_Input) {
  _inherits(InputYml, _Input);
  var _super = _createSuper(InputYml);
  function InputYml(env) {
    var _this;
    _classCallCheck(this, InputYml);
    _this = _super.call(this, env);
    _defineProperty(_assertThisInitialized(_this), "loadPrefixes", function () {
      _this.defaultPrefixFile = _this.config.volume + _this.config.monitoredPrefixesFiles[0];
      if (!_fs["default"].existsSync(_this.defaultPrefixFile)) {
        return _this.generate().then(function () {
          return _this._loadPrefixes();
        });
      }
      return _this._loadPrefixes();
    });
    _defineProperty(_assertThisInitialized(_this), "_watchPrefixFile", function (file) {
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
    _defineProperty(_assertThisInitialized(_this), "_loadPrefixes", function () {
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
            var fileContent = void 0;
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
                        group: 'default'
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
                    group: 'default',
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
          };
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _ret = _loop();
            if (_typeof(_ret) === "object") return _ret.v;
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
    _defineProperty(_assertThisInitialized(_this), "validate", function (fileContent) {
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
    _defineProperty(_assertThisInitialized(_this), "_validateRegex", function (regex) {
      if (regex) {
        try {
          new RegExp(regex);
        } catch (e) {
          return "Not valid Path regex" + regex;
        }
      }
    });
    _defineProperty(_assertThisInitialized(_this), "getMonitoredMoreSpecifics", function () {
      return _this.prefixes.filter(function (p) {
        return !p.ignoreMorespecifics;
      });
    });
    _defineProperty(_assertThisInitialized(_this), "getMonitoredPrefixes", function () {
      return _this.prefixes;
    });
    _defineProperty(_assertThisInitialized(_this), "getMonitoredASns", function () {
      return _this.asns;
    });
    _defineProperty(_assertThisInitialized(_this), "save", function (content) {
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
    _defineProperty(_assertThisInitialized(_this), "retrieve", function () {
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
              group: asnRule.group,
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
  return _createClass(InputYml);
}(_input["default"]);
exports["default"] = InputYml;