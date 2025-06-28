"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _config = _interopRequireDefault(require("./config"));
var _jsYaml = _interopRequireDefault(require("js-yaml"));
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
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
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ConfigYml = exports["default"] = /*#__PURE__*/function (_Config) {
  function ConfigYml(params) {
    var _this;
    _classCallCheck(this, ConfigYml);
    _this = _callSuper(this, ConfigYml, [params]);
    _defineProperty(_this, "save", function (config) {
      try {
        _fs["default"].writeFileSync(_this.configFile, _jsYaml["default"].dump(config));
        _jsYaml["default"].load(_fs["default"].readFileSync(_this.configFile, "utf8")); // Test readability and format
      } catch (error) {
        throw new Error("Cannot save the configuration in " + _this.configFile);
      }
    });
    _defineProperty(_this, "retrieve", function () {
      var ymlBasicConfig = _jsYaml["default"].dump(_this["default"]);
      if (_fs["default"].existsSync(_this.configFile)) {
        try {
          var config = _jsYaml["default"].load(_fs["default"].readFileSync(_this.configFile, "utf8")) || _this["default"];
          _this._readUserGroupsFiles(config);
          return config;
        } catch (error) {
          throw new Error("The file " + _this.configFile + " is not valid yml: " + error.message.split(":")[0]);
        }
      } else {
        console.log("Impossible to load config.yml. A default configuration file has been generated.");
        _this.downloadDefault().then(function (data) {
          _fs["default"].writeFileSync(_this.configFile, data);
          _jsYaml["default"].load(_fs["default"].readFileSync(_this.configFile, "utf8")); // Test readability and format

          _this._readUserGroupsFiles(data);
        })["catch"](function () {
          _fs["default"].writeFileSync(_this.configFile, ymlBasicConfig); // Download failed, write simple default config
        });
        return _this["default"];
      }
    });
    _defineProperty(_this, "_readUserGroupsFiles", function (config) {
      if (config.groupsFile) {
        _this.groupsFile = config.volume ? config.volume + config.groupsFile : _path["default"].resolve(process.cwd(), config.groupsFile);
        var userGroups = _jsYaml["default"].load(_fs["default"].readFileSync(_this.groupsFile, "utf8"));
        var _iterator = _createForOfIteratorHelper(config.reports),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var report = _step.value;
            var name = report.file;
            var groups = userGroups[name];
            if (userGroups[name]) {
              report.params.userGroups = groups;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        _fs["default"].watchFile(_this.groupsFile, function () {
          if (_this._watchPrefixFileTimer) {
            clearTimeout(_this._watchPrefixFileTimer);
          }
          _this._watchPrefixFileTimer = setTimeout(function () {
            var userGroups = _jsYaml["default"].load(_fs["default"].readFileSync(_this.groupsFile, "utf8"));
            var _iterator2 = _createForOfIteratorHelper(config.reports),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var report = _step2.value;
                var name = report.file;
                var groups = userGroups[name];
                if (userGroups[name]) {
                  report.params.userGroups = groups;
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }, 5000);
        });
      }
    });
    _this.configFile = global.EXTERNAL_CONFIG_FILE || (global.EXTERNAL_VOLUME_DIRECTORY ? global.EXTERNAL_VOLUME_DIRECTORY + "config.yml" : _path["default"].resolve(process.cwd(), "config.yml"));
    _this.groupsFile = global.EXTERNAL_GROUP_FILE;
    console.log("Loaded config:", _this.configFile);
    return _this;
  }
  _inherits(ConfigYml, _Config);
  return _createClass(ConfigYml);
}(_config["default"]);