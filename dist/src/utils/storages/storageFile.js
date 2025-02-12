"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _storage = _interopRequireDefault(require("../storage"));
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var StorageFile = exports["default"] = /*#__PURE__*/function (_Storage) {
  function StorageFile(params, config) {
    var _this;
    _classCallCheck(this, StorageFile);
    _this = _callSuper(this, StorageFile, [params, config]);
    _defineProperty(_this, "_set", function (key, value) {
      return new Promise(function (resolve, reject) {
        if (_this.enabled) {
          var file = _this.directory + key + ".json";
          try {
            _fs["default"].writeFileSync(file, JSON.stringify(value));
            resolve(true);
          } catch (error) {
            reject(error);
          }
        } else {
          reject("The .cache/ directory is not writeable");
        }
      });
    });
    _defineProperty(_this, "_get", function (key) {
      return new Promise(function (resolve, reject) {
        if (_this.enabled) {
          var file = _this.directory + key + ".json";
          try {
            if (_fs["default"].existsSync(file)) {
              resolve(JSON.parse(_fs["default"].readFileSync(file, "utf8")));
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          reject("The .cache/ directory is not writeable");
        }
      });
    });
    _this.directory = _this.config.volume + (_this.params.directory || ".cache/");
    _this.enabled = true;
    try {
      if (!_fs["default"].existsSync(_this.directory)) {
        _fs["default"].mkdirSync(_this.directory, {
          recursive: true
        });
      }
    } catch (error) {
      _this.enabled = false;
    }
    return _this;
  }
  _inherits(StorageFile, _Storage);
  return _createClass(StorageFile);
}(_storage["default"]);