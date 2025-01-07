"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Path = exports.AS = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Path = exports.Path = /*#__PURE__*/function () {
  function Path(listAS) {
    _classCallCheck(this, Path);
    this.value = listAS;
  }
  return _createClass(Path, [{
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
    key: "getUniqueValues",
    value: function getUniqueValues() {
      var _this$uniqueValues;
      if (!this.uniqueValues) {
        var index = {};
        var out = [];
        var _iterator = _createForOfIteratorHelper(this.value),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var asn = _step.value;
            var key = asn.getId();
            if (!index[key]) {
              out.push(asn);
              index[key] = asn;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.uniqueValues = out;
      }
      return (_this$uniqueValues = this.uniqueValues) !== null && _this$uniqueValues !== void 0 ? _this$uniqueValues : [];
    }
  }, {
    key: "getNeighbors",
    value: function getNeighbors(of) {
      var path = [null].concat(_toConsumableArray(this.getUniqueValues()), [null]);
      var simplePath = path.map(function (i) {
        var _i$numbers$, _i$numbers;
        return (_i$numbers$ = i === null || i === void 0 || (_i$numbers = i.numbers) === null || _i$numbers === void 0 ? void 0 : _i$numbers[0]) !== null && _i$numbers$ !== void 0 ? _i$numbers$ : null;
      });
      var asn = of.numbers[0];
      var i = simplePath.indexOf(asn);
      if (i >= 0) {
        var _path$slice = path.slice(i - 1, i + 2),
          _path$slice2 = _slicedToArray(_path$slice, 3),
          _path$slice2$ = _path$slice2[0],
          left = _path$slice2$ === void 0 ? null : _path$slice2$,
          _path$slice2$2 = _path$slice2[1],
          current = _path$slice2$2 === void 0 ? null : _path$slice2$2,
          _path$slice2$3 = _path$slice2[2],
          right = _path$slice2$3 === void 0 ? null : _path$slice2$3;
        return [left !== null && left !== void 0 ? left : null, current, right !== null && right !== void 0 ? right : null];
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
}();
var AS = exports.AS = /*#__PURE__*/function () {
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
  return _createClass(AS, [{
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
      var _this = this;
      return ASn.numbers.every(function (i) {
        return _this.numbers.includes(i);
      });
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
}();
_defineProperty(AS, "_instances", {});