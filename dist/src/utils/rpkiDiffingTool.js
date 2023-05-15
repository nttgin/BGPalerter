"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diff = diff;
exports.getPrefixes = getPrefixes;
exports.getRelevant = getRelevant;
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
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