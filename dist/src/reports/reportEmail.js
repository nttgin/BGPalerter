"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _report = _interopRequireDefault(require("./report"));
var _nodemailer = _interopRequireDefault(require("nodemailer"));
var _emailTemplates = _interopRequireDefault(require("./email_templates/emailTemplates"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
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
var ReportEmail = /*#__PURE__*/function (_Report) {
  _inherits(ReportEmail, _Report);
  var _super = _createSuper(ReportEmail);
  function ReportEmail(channels, params, env) {
    var _this;
    _classCallCheck(this, ReportEmail);
    _this = _super.call(this, channels, params, env);
    _defineProperty(_assertThisInitialized(_this), "getUserGroup", function (group) {
      var groups = _this.params.notifiedEmails || _this.params.userGroups;
      return groups[group] || groups["default"];
    });
    _defineProperty(_assertThisInitialized(_this), "getEmails", function (content) {
      var users = content.data.map(function (item) {
        if (item.matchedRule) {
          return item.matchedRule.group || "default";
        } else {
          return false;
        }
      }).filter(function (item) {
        return !!item;
      });
      try {
        return _toConsumableArray(new Set(users)).map(function (user) {
          return _this.getUserGroup(user);
        }).filter(function (item) {
          return !!item;
        });
      } catch (error) {
        _this.logger.log({
          level: 'error',
          message: 'Not all groups have an associated email address'
        });
      }
      return [];
    });
    _defineProperty(_assertThisInitialized(_this), "getEmailText", function (channel, content) {
      var context = _this.getContext(channel, content);
      var paths = JSON.parse("[".concat(context.paths, "]"));
      context.paths = paths.length ? paths.join("\n") : "Disabled";
      return _this.parseTemplate(_this.templates[channel], context);
    });
    _defineProperty(_assertThisInitialized(_this), "_sendEmail", function (email) {
      _this.transporter.sendMail(email)["catch"](function (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      });
    });
    _defineProperty(_assertThisInitialized(_this), "report", function (channel, content) {
      if (_this.enabled) {
        var emailGroups = _this.getEmails(content);
        var _iterator = _createForOfIteratorHelper(emailGroups),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var emails = _step.value;
            var text = _this.getEmailText(channel, content);
            if (text) {
              var to = emails.join(', ');
              _this.logger.log({
                level: 'info',
                message: "[reportEmail] sending report to: ".concat(to)
              });
              _this.emailBacklog.push({
                from: _this.params.senderEmail,
                to: to,
                subject: 'BGP alert: ' + channel,
                text: text
              });
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    });
    _this.emailTemplates = new _emailTemplates["default"](_this.logger);
    _this.templates = {};
    _this.emailBacklog = [];
    if (!_this.getUserGroup("default")) {
      _this.enabled = false;
      _this.logger.log({
        level: 'error',
        message: "In notifiedEmails, for reportEmail, a group named 'default' is required for communications to the admin."
      });
    } else {
      _this.transporter = _nodemailer["default"].createTransport(_this.params.smtp);
      var _iterator2 = _createForOfIteratorHelper(channels),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var channel = _step2.value;
          try {
            _this.templates[channel] = _this.emailTemplates.getTemplate(channel);
          } catch (error) {
            _this.logger.log({
              level: 'error',
              message: channel + ' template cannot be loaded'
            });
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      if (Object.keys(_this.templates).length === 0) {
        _this.enabled = false;
        _this.logger.log({
          level: 'error',
          message: "Email templates cannot be associated to channels."
        });
      }
      setInterval(function () {
        var nextEmail = _this.emailBacklog.pop();
        if (nextEmail) {
          _this._sendEmail(nextEmail);
        }
      }, 3000);
    }
    return _this;
  }
  return _createClass(ReportEmail);
}(_report["default"]);
exports["default"] = ReportEmail;