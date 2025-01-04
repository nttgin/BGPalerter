"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diff = diff;
exports.getPrefixes = getPrefixes;
exports.getRelevant = getRelevant;
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function getPrefixes(vrp, asn) {
  return _toConsumableArray(new Set(vrp.filter(function (i) {
    return i.asn === asn;
  }).map(function (i) {
    return i.prefix;
  })));
}
function getRelevant(vrp, prefixes) {
  var asns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  return vrp.filter(function (i) {
    return asns.includes(i.asn) || prefixes.includes(i.prefix);
  });
}
function diff(vrpsOld, vrpsNew, asn) {
  var prefixesIn = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  asn = parseInt(asn);
  var prefixes;
  if (asn) {
    prefixes = _toConsumableArray(new Set(prefixesIn));
  } else {
    prefixes = _toConsumableArray(new Set([].concat(_toConsumableArray(prefixesIn), _toConsumableArray(getPrefixes(vrpsOld, asn)), _toConsumableArray(getPrefixes(vrpsNew, asn)))));
  }
  var filteredVrpsOld = JSON.parse(JSON.stringify(getRelevant(vrpsOld, prefixes, [asn]))).map(function (i) {
    i.status = "removed";
    return i;
  });
  var filteredVrpsNew = JSON.parse(JSON.stringify(getRelevant(vrpsNew, prefixes, [asn]))).map(function (i) {
    i.status = "added";
    return i;
  });
  var index = {};
  var _iterator = _createForOfIteratorHelper(filteredVrpsOld.concat(filteredVrpsNew)),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var vrp = _step.value;
      var key = "".concat(vrp.ta, "-").concat(vrp.prefix, "-").concat(vrp.asn, "-").concat(vrp.maxLength);
      index[key] = index[key] || [];
      index[key].push(vrp);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return Object.values(index).filter(function (i) {
    return i.length === 1;
  }).map(function (i) {
    return i[0];
  });
}