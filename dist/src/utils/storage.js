"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Storage = exports["default"] = /*#__PURE__*/_createClass(function Storage(params, config) {
  var _this = this;
  _classCallCheck(this, Storage);
  _defineProperty(this, "set", function (key, value) {
    if (/^[A-Za-z0-9\-_]+$/i.test(key)) {
      var envelop = {
        date: new Date().getTime(),
        value: value
      };
      return _this._set(key, envelop);
    } else {
      return Promise.reject("Not a valid key. Use only chars and dashes.");
    }
  });
  _defineProperty(this, "get", function (key) {
    return _this._get(key).then(function (data) {
      if (!!data) {
        var date = data.date,
          value = data.value;
        var now = new Date().getTime();
        if (date + _this.validity >= now) {
          return value;
        }
      }
      return {};
    });
  });
  _defineProperty(this, "_set", function (key, value) {
    throw new Error("The set method must be implemented");
  });
  _defineProperty(this, "_get", function (key) {
    throw new Error("The get method must be implemented");
  });
  this.config = config;
  this.params = params;
  this.validity = (this.params.validitySeconds ? this.params.validitySeconds * 1000 : null) || Infinity;
});