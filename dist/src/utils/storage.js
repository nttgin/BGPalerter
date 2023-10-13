"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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