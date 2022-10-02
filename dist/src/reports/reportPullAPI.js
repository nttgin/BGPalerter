"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _report = _interopRequireDefault(require("./report"));

var _restApi = _interopRequireDefault(require("../utils/restApi"));

var _md = _interopRequireDefault(require("md5"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

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

var ReportPullAPI = /*#__PURE__*/function (_Report) {
  _inherits(ReportPullAPI, _Report);

  var _super = _createSuper(ReportPullAPI);

  function ReportPullAPI(channels, params, env) {
    var _this;

    _classCallCheck(this, ReportPullAPI);

    _this = _super.call(this, channels, params, env);

    _defineProperty(_assertThisInitialized(_this), "respond", function (req, res, next) {
      res.contentType = 'json';
      res.send({
        meta: {
          lastQuery: _this.lastQuery
        },
        data: _this._getAlerts(req.params)
      });
      next();
      _this.lastQuery = new Date().getTime();
    });

    _defineProperty(_assertThisInitialized(_this), "_getAlerts", function (_ref) {
      var hash = _ref.hash,
          group = _ref.group;
      var alerts;

      if (group) {
        alerts = _this.alerts.filter(function (i) {
          return i.group === group;
        });
      } else if (hash) {
        alerts = _this.alerts.filter(function (i) {
          return i.alert.hash === hash;
        });
      } else {
        alerts = _this.alerts;
      }

      return alerts.map(function (i) {
        return i.alert;
      });
    });

    _defineProperty(_assertThisInitialized(_this), "getUserGroup", function (group) {
      return null;
    });

    _defineProperty(_assertThisInitialized(_this), "report", function (channel, content) {
      if (_this.enabled) {
        var groups = content.data.map(function (i) {
          return i.matchedRule.group;
        }).filter(function (i) {
          return i != null;
        });
        groups = groups.length ? _toConsumableArray(new Set(groups)) : ["default"];
        content.hash = (0, _md["default"])(content.id);

        var _iterator = _createForOfIteratorHelper(groups),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var group = _step.value;

            _this.alerts.push({
              group: group,
              alert: content
            });

            _this.alerts = _this.alerts.slice(-_this.maxAlertsAmount);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    });

    _this.name = "reportPullAPI" || _this.params.name;
    _this.enabled = true;
    _this.maxAlertsAmount = _this.params.maxAlertsAmount || 100;
    _this.lastQuery = null;
    var restDefault = env.config.rest || {
      port: params.port,
      host: params.host
    };
    var rest = new _restApi["default"](restDefault);
    rest.addUrl('/alerts', _this.respond)["catch"](function (error) {
      env.logger.log({
        level: 'error',
        message: error
      });
    });
    rest.addUrl('/alerts/:hash', _this.respond)["catch"](function (error) {
      env.logger.log({
        level: 'error',
        message: error
      });
    });
    rest.addUrl('/alerts/groups/:group', _this.respond)["catch"](function (error) {
      env.logger.log({
        level: 'error',
        message: error
      });
    });
    _this.alerts = [];
    return _this;
  }

  return _createClass(ReportPullAPI);
}(_report["default"]);

exports["default"] = ReportPullAPI;