"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Path = exports.AS = void 0;
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Path = /*#__PURE__*/function () {
  function Path(listAS) {
    _classCallCheck(this, Path);
    this.value = listAS;
  }
  _createClass(Path, [{
    key: "getLast",
    value: function getLast() {
      return this.value[this.value.length - 1];
    }
  }, {
    key: "length",
    value: function length() {
      return this.value.length;
    }
  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify(this.toJSON());
    }
  }, {
    key: "getValues",
    value: function getValues() {
      return this.value.map(function (i) {
        return i.getValue();
      });
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.getValues();
    }
  }, {
    key: "getNeighbors",
    value: function getNeighbors(asn) {
      var path = this.value;
      var length = path.length - 1;
      for (var n = 0; n < length; n++) {
        var current = path[n] || null;
        if (current.getId() === asn.getId()) {
          var left = path[n - 1] || null;
          var right = path[n + 1] || null;
          return [left, current, right];
        }
      }
      return [null, null, null];
    }
  }, {
    key: "includes",
    value: function includes(asn) {
      return this.value.some(function (i) {
        return i.includes(asn);
      });
    }
  }]);
  return Path;
}();
exports.Path = Path;
var AS = /*#__PURE__*/function () {
  function AS(numbers) {
    _classCallCheck(this, AS);
    this.numbers = null;
    this.ASset = false;
    this._valid = null;
    if (["string", "number"].includes(_typeof(numbers))) {
      this.numbers = [numbers];
    } else if (numbers instanceof Array && numbers.length) {
      if (numbers.length > 1) {
        this.ASset = true;
      }
      this.numbers = numbers;
    }
    if (this.isValid()) {
      this.numbers = this.numbers.map(function (i) {
        return parseInt(i);
      });
      var key = this.numbers.join("-");
      if (!!AS._instances[key]) {
        return AS._instances[key];
      }
      AS._instances[key] = this;
    } else {
      throw new Error("Not valid AS number");
    }
  }
  _createClass(AS, [{
    key: "getId",
    value: function getId() {
      return this.numbers.length === 1 ? this.numbers[0] : this.numbers.sort().join("-");
    }
  }, {
    key: "isValid",
    value: function isValid() {
      if (this._valid === null) {
        this._valid = this.numbers && this.numbers.length > 0 && this.numbers.every(function (asn) {
          try {
            var intAsn = parseInt(asn);
            if (intAsn != asn) {
              return false;
            }
            asn = intAsn;
          } catch (e) {
            return false;
          }
          return asn >= 0 && asn <= 4294967295;
        }) && _toConsumableArray(new Set(this.numbers.map(function (i) {
          return parseInt(i);
        }))).length === this.numbers.length;
      }
      return this._valid;
    }
  }, {
    key: "includes",
    value: function includes(ASn) {
      var _iterator = _createForOfIteratorHelper(ASn.numbers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var a = _step.value;
          if (!this.numbers.includes(a)) {
            return false;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return true;
    }
  }, {
    key: "isASset",
    value: function isASset() {
      return this.ASset;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return this.numbers.length > 1 ? this.numbers : this.numbers[0];
    }
  }, {
    key: "toString",
    value: function toString() {
      var list = this.numbers.map(function (i) {
        return "AS" + i;
      });
      return (list.length === 1 ? list : list.slice(0, list.length - 1).map(function (i) {
        return [i, ", "];
      }).concat(["and ", list[list.length - 1]]).flat()).join("");
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.numbers;
    }
  }]);
  return AS;
}();
exports.AS = AS;
_defineProperty(AS, "_instances", {});