"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _report = _interopRequireDefault(require("./report"));

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

var ReportHTTP = /*#__PURE__*/function (_Report) {
  _inherits(ReportHTTP, _Report);

  var _super = _createSuper(ReportHTTP);

  function ReportHTTP(channels, params, env) {
    var _this;

    _classCallCheck(this, ReportHTTP);

    _this = _super.call(this, channels, params, env);

    _defineProperty(_assertThisInitialized(_this), "getUserGroup", function (group) {
      var groups = _this.params.hooks || _this.params.userGroups || {};
      return groups[group] || groups["default"];
    });

    _defineProperty(_assertThisInitialized(_this), "getTemplate", function (group, channel, content) {
      return _this.params.templates[channel] || _this.params.templates["default"];
    });

    _defineProperty(_assertThisInitialized(_this), "_sendHTTPMessage", function (group, channel, content) {
      var url = _this.getUserGroup(group);

      if (url) {
        var context = _this.getContext(channel, content);

        if (_this.params.showPaths > 0 && context.pathNumber > 0) {
          context.summary = "".concat(context.summary, ". Top ").concat(context.pathNumber, " most used AS paths: ").concat(context.paths, ".");
        }

        var blob = _this.parseTemplate(_this.getTemplate(group, channel, content), context);

        _this.logger.log({
          level: 'info',
          message: "[".concat(_this.name, "] sending report to: ").concat(url)
        });

        _this.axios({
          url: url,
          method: "POST",
          headers: _this.headers,
          data: _this.params.isTemplateJSON ? JSON.parse(blob) : blob
        })["catch"](function (error) {
          _this.logger.log({
            level: 'error',
            message: error
          });
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "report", function (channel, content) {
      if (_this.enabled) {
        var groups = content.data.map(function (i) {
          return i.matchedRule.group;
        }).filter(function (i) {
          return i != null;
        });
        groups = groups.length ? _toConsumableArray(new Set(groups)) : ["default"];

        var _iterator = _createForOfIteratorHelper(groups),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var group = _step.value;

            _this._sendHTTPMessage(group, channel, content);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    });

    _this.name = "reportHTTP" || _this.params.name;
    _this.enabled = true;

    if (!_this.getUserGroup("default")) {
      _this.logger.log({
        level: 'error',
        message: "".concat(_this.name, " reporting is not enabled: no default group defined")
      });

      _this.enabled = false;
    }

    _this.headers = _this.params.headers || {};

    if (_this.params.isTemplateJSON) {
      _this.headers["Content-Type"] = "application/json";
    }

    return _this;
  }

  return _createClass(ReportHTTP);
}(_report["default"]);

exports["default"] = ReportHTTP;