"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _report = _interopRequireDefault(require("./report"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var ReportFile = /*#__PURE__*/function (_Report) {
  _inherits(ReportFile, _Report);

  var _super = _createSuper(ReportFile);

  function ReportFile(channels, params, env) {
    var _this;

    _classCallCheck(this, ReportFile);

    _this = _super.call(this, channels, params, env);

    _defineProperty(_assertThisInitialized(_this), "writeDataOnFile", function (message) {
      try {
        var timestamp = "".concat(message.earliest, "-").concat(message.latest);

        _this.latestTimestamps.push(timestamp);

        var count = _this.latestTimestamps.filter(function (i) {
          return i === timestamp;
        }).length;

        _this.latestTimestamps = _this.latestTimestamps.slice(-_this.timestampsBacklogSize);
        var filename = "".concat(_this.alertsDirectory, "/alert-").concat(timestamp, "-").concat(count, ".json");

        if (!_fs["default"].existsSync(_this.alertsDirectory)) {
          _fs["default"].mkdirSync(_this.alertsDirectory);
        }

        _fs["default"].writeFileSync(filename, JSON.stringify(message));
      } catch (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "report", function (message, content) {
      _this.logger.log({
        level: 'verbose',
        message: content.message
      });

      if (_this.persistAlerts) {
        _this.writeDataOnFile(content);
      }
    });

    _this.persistAlerts = params.persistAlertData;
    _this.alertsDirectory = env.config.volume + params.alertDataDirectory;

    if (_this.persistAlerts && !_this.alertsDirectory) {
      _this.persistAlerts = false;

      _this.logger.log({
        level: 'error',
        message: "Cannot persist alert data, the parameter alertDataDirectory is missing."
      });
    }

    _this.latestTimestamps = [];
    _this.timestampsBacklogSize = 100;
    return _this;
  }

  return _createClass(ReportFile);
}(_report["default"]);

exports["default"] = ReportFile;