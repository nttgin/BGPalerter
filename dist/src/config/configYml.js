"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./config"));

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var ConfigYml = /*#__PURE__*/function (_Config) {
  _inherits(ConfigYml, _Config);

  var _super = _createSuper(ConfigYml);

  function ConfigYml(params) {
    var _this;

    _classCallCheck(this, ConfigYml);

    _this = _super.call(this, params);

    _defineProperty(_assertThisInitialized(_this), "save", function (config) {
      try {
        _fs["default"].writeFileSync(_this.configFile, _jsYaml["default"].dump(config));

        _jsYaml["default"].load(_fs["default"].readFileSync(_this.configFile, 'utf8')); // Test readability and format

      } catch (error) {
        throw new Error("Cannot save the configuration in " + _this.configFile);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "retrieve", function () {
      var ymlBasicConfig = _jsYaml["default"].dump(_this["default"]);

      if (_fs["default"].existsSync(_this.configFile)) {
        try {
          var config = _jsYaml["default"].load(_fs["default"].readFileSync(_this.configFile, 'utf8')) || _this["default"];

          _this._readUserGroupsFiles(config);

          return config;
        } catch (error) {
          throw new Error("The file " + _this.configFile + " is not valid yml: " + error.message.split(":")[0]);
        }
      } else {
        console.log("Impossible to load config.yml. A default configuration file has been generated.");

        _this.downloadDefault().then(function (data) {
          _fs["default"].writeFileSync(_this.configFile, data);

          _jsYaml["default"].load(_fs["default"].readFileSync(_this.configFile, 'utf8')); // Test readability and format


          _this._readUserGroupsFiles(data);
        })["catch"](function () {
          _fs["default"].writeFileSync(_this.configFile, ymlBasicConfig); // Download failed, write simple default config

        });

        return _this["default"];
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_readUserGroupsFiles", function (config) {
      if (config.groupsFile) {
        _this.groupsFile = config.volume ? config.volume + config.groupsFile : _path["default"].resolve(process.cwd(), config.groupsFile);

        var userGroups = _jsYaml["default"].load(_fs["default"].readFileSync(_this.groupsFile, 'utf8'));

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
            var userGroups = _jsYaml["default"].load(_fs["default"].readFileSync(_this.groupsFile, 'utf8'));

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

    _this.configFile = global.EXTERNAL_CONFIG_FILE || (global.EXTERNAL_VOLUME_DIRECTORY ? global.EXTERNAL_VOLUME_DIRECTORY + 'config.yml' : _path["default"].resolve(process.cwd(), 'config.yml'));
    _this.groupsFile = global.EXTERNAL_GROUP_FILE;
    console.log("Loaded config:", _this.configFile);
    return _this;
  }

  return _createClass(ConfigYml);
}(_config["default"]);

exports["default"] = ConfigYml;