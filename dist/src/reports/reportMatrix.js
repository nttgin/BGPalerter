"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _reportHTTP = _interopRequireDefault(require("./reportHTTP"));
var _uuid = require("uuid");
var _brembo = _interopRequireDefault(require("brembo"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
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
var reportMatrix = /*#__PURE__*/function (_ReportHTTP) {
  _inherits(reportMatrix, _ReportHTTP);
  var _super = _createSuper(reportMatrix);
  function reportMatrix(channels, params, env) {
    var _this;
    _classCallCheck(this, reportMatrix);
    var hooks = {};
    for (var userGroup in (_params$roomIds = params === null || params === void 0 ? void 0 : params.roomIds) !== null && _params$roomIds !== void 0 ? _params$roomIds : []) {
      var _params$roomIds;
      hooks[userGroup] = _brembo["default"].build(params === null || params === void 0 ? void 0 : params.homeserverUrl, {
        path: ["_matrix", "client", "v3", "rooms", encodeURIComponent(params === null || params === void 0 ? void 0 : params.roomIds[userGroup]), "send", "m.room.message"]
      });
    }
    var matrixParams = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + params.accessToken
      },
      isTemplateJSON: true,
      showPaths: params.showPaths,
      hooks: hooks,
      name: "reportMatrix",
      method: "put",
      templates: {}
    };
    _this = _super.call(this, channels, matrixParams, env);
    _defineProperty(_assertThisInitialized(_this), "getUserGroup", function (group) {
      var transactionId = (0, _uuid.v4)();
      var groups = _this.params.hooks || _this.params.userGroups || {};
      var baseUrl = groups[group] || groups["default"];
      return _brembo["default"].build(baseUrl, {
        path: [transactionId]
      });
    });
    _defineProperty(_assertThisInitialized(_this), "getTemplate", function (group, channel, content) {
      return JSON.stringify({
        "msgtype": "m.text",
        "body": "${summary}${markDownUrl}"
      });
    });
    _this.roomIds = params.roomIds;
    if (!params.homeserverUrl || !params.accessToken) {
      _this.logger.log({
        level: 'error',
        message: "".concat(_this.name, " reporting is not enabled: homeserverUrl and accessToken are required")
      });
      _this.enabled = false;
    }
    if (!params.roomIds || !params.roomIds["default"]) {
      _this.logger.log({
        level: 'error',
        message: "".concat(_this.name, " reporting is not enabled: no default room id provided")
      });
      _this.enabled = false;
    }
    return _this;
  }
  return _createClass(reportMatrix);
}(_reportHTTP["default"]);
exports["default"] = reportMatrix;