"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _monitor = _interopRequireDefault(require("./monitor"));

var _ipSub = _interopRequireDefault(require("ip-sub"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var MonitorHijack = /*#__PURE__*/function (_Monitor) {
  _inherits(MonitorHijack, _Monitor);

  var _super = _createSuper(MonitorHijack);

  function MonitorHijack(name, channel, params, env, input) {
    var _this;

    _classCallCheck(this, MonitorHijack);

    _this = _super.call(this, name, channel, params, env, input);

    _defineProperty(_assertThisInitialized(_this), "updateMonitoredResources", function () {
      _this.monitored = _this.input.getMonitoredPrefixes();
    });

    _defineProperty(_assertThisInitialized(_this), "filter", function (message) {
      return message.type === 'announcement';
    });

    _defineProperty(_assertThisInitialized(_this), "squashAlerts", function (alerts) {
      var peers = _toConsumableArray(new Set(alerts.map(function (alert) {
        return alert.matchedMessage.peer;
      }))).length;

      if (peers >= _this.thresholdMinPeers) {
        var matchedRule = alerts[0].matchedRule;
        var message = alerts[0].matchedMessage;
        var asnText = matchedRule.asn;
        return _ipSub["default"]._isEqualPrefix(message.prefix, matchedRule.prefix) ? "The prefix ".concat(matchedRule.prefix, " (").concat(matchedRule.description, ") is announced by ").concat(message.originAS, " instead of ").concat(asnText) : "A new prefix ".concat(message.prefix, " is announced by ").concat(message.originAS, ". ") + "It should be instead ".concat(matchedRule.prefix, " (").concat(matchedRule.description, ") announced by ").concat(asnText);
      }

      return false;
    });

    _defineProperty(_assertThisInitialized(_this), "validate", function (message, matchedRule) {
      _this.rpki.addToValidationQueue(message, matchedRule, _this._validate);
    });

    _defineProperty(_assertThisInitialized(_this), "_validate", function (result, message, matchedRule) {
      if (!result.valid) {
        _this.publishAlert(message.originAS.getId() + "-" + message.prefix, matchedRule.asn.getId(), matchedRule, message, {});
      }
    });

    _defineProperty(_assertThisInitialized(_this), "monitor", function (message) {
      return new Promise(function (resolve, reject) {
        var messagePrefix = message.prefix;

        var matchedRule = _this.getMoreSpecificMatch(messagePrefix, false);

        if (matchedRule && !matchedRule.ignore && !matchedRule.asn.includes(message.originAS)) {
          _this.validate(message, matchedRule);

          resolve(true);
        }
      });
    });

    _this.thresholdMinPeers = params && params.thresholdMinPeers != null ? params.thresholdMinPeers : 2;

    _this.updateMonitoredResources();

    return _this;
  }

  return _createClass(MonitorHijack);
}(_monitor["default"]);

exports["default"] = MonitorHijack;