"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _brembo = _interopRequireDefault(require("brembo"));

var _axios = _interopRequireDefault(require("axios"));

var _axiosEnrich = _interopRequireDefault(require("../utils/axiosEnrich"));

var _rpkiValidator = _interopRequireDefault(require("rpki-validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Report = /*#__PURE__*/_createClass(function Report(channels, params, env) {
  var _this = this;

  _classCallCheck(this, Report);

  _defineProperty(this, "getBGPlayLink", function (prefix, start, end) {
    var instant = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var rrcs = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [0, 1, 2, 5, 6, 7, 10, 11, 13, 14, 15, 16, 18, 20];
    var bgplayTimeOffset = 5 * 60; // 5 minutes

    return _brembo["default"].build("https://bgplay.massimocandela.com/", {
      path: [],
      params: {
        "resource": prefix,
        "ignoreReannouncements": true,
        "starttime": (0, _moment["default"])(start).utc().unix() - bgplayTimeOffset,
        "endtime": (0, _moment["default"])(end).utc().unix(),
        "rrcs": rrcs.join(","),
        "instant": null,
        "type": "bgp"
      }
    });
  });

  _defineProperty(this, "getRpkiLink", function (prefix, asn) {
    asn = asn && asn.getValue() || [];
    asn = Array.isArray(asn) ? [] : [asn];
    return _brembo["default"].build("https://rpki.massimocandela.com/", {
      path: ["#", prefix].concat(asn),
      params: {
        "sources": _rpkiValidator["default"].providers.join(",")
      }
    });
  });

  _defineProperty(this, "getContext", function (channel, content) {
    try {
      var context = {
        summary: content.message,
        earliest: (0, _moment["default"])(content.earliest).utc().format("YYYY-MM-DD HH:mm:ss"),
        latest: (0, _moment["default"])(content.latest).utc().format("YYYY-MM-DD HH:mm:ss"),
        channel: channel,
        type: content.origin,
        bgplay: "",
        rpkiLink: "",
        slackUrl: "",
        markDownUrl: "",
        pathNumber: 0,
        paths: ""
      };
      var matched = null;
      var pathsCount = {};
      var sortedPathIndex;

      if (_this.params.showPaths > 0) {
        content.data.filter(function (i) {
          var _i$matchedMessage, _i$matchedMessage$pat;

          return (i === null || i === void 0 ? void 0 : (_i$matchedMessage = i.matchedMessage) === null || _i$matchedMessage === void 0 ? void 0 : (_i$matchedMessage$pat = _i$matchedMessage.path) === null || _i$matchedMessage$pat === void 0 ? void 0 : _i$matchedMessage$pat.length()) > 1;
        }).map(function (i) {
          return JSON.stringify(i.matchedMessage.path.getValues().slice(channel === "path" ? 0 : 1));
        }).forEach(function (path) {
          if (!pathsCount[path]) {
            pathsCount[path] = 0;
          }

          pathsCount[path]++;
        });
        sortedPathIndex = Object.keys(pathsCount).map(function (key) {
          return [key, pathsCount[key]];
        });
        sortedPathIndex.sort(function (first, second) {
          return second[1] - first[1];
        });
        context.pathNumber = Math.min(_this.params.showPaths, sortedPathIndex.length);
        context.paths = sortedPathIndex.slice(0, _this.params.showPaths).map(function (i) {
          return i[0];
        }).join(",");
      }

      switch (channel) {
        case "hijack":
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description;
          context.asn = matched.asn.toString();
          context.peers = _toConsumableArray(new Set(content.data.map(function (alert) {
            return alert.matchedMessage.peer;
          }))).length;
          context.neworigin = content.data[0].matchedMessage.originAS;
          context.newprefix = content.data[0].matchedMessage.prefix;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          break;

        case "visibility":
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description;
          context.asn = matched.asn.toString();
          context.peers = _toConsumableArray(new Set(content.data.map(function (alert) {
            return alert.matchedMessage.peer;
          }))).length;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          break;

        case "newprefix":
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description;
          context.asn = matched.asn.toString();
          context.peers = _toConsumableArray(new Set(content.data.map(function (alert) {
            return alert.matchedMessage.peer;
          }))).length;
          context.neworigin = content.data[0].matchedMessage.originAS;
          context.newprefix = content.data[0].matchedMessage.prefix;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          break;

        case "software-update":
          break;

        case "path":
          break;

        case "misconfiguration":
          context.asn = content.data[0].matchedRule.asn.toString();
          context.prefix = content.data[0].matchedMessage.prefix;
          break;

        case "rpki":
          matched = content.data[0].matchedRule;
          context.extra = content.data[0].extra;
          context.asn = (matched.asn || "").toString();
          context.prefix = matched.prefix || content.data[0].matchedMessage.prefix;
          context.description = matched.description || "";
          context.neworigin = content.data[0].matchedMessage.originAS;
          context.newprefix = content.data[0].matchedMessage.prefix;
          context.bgplay = _this.getBGPlayLink(matched.prefix, content.earliest, content.latest);
          context.rpkiLink = _this.getRpkiLink(context.newprefix, context.neworigin);
          context.slackUrl = " [<".concat(context.rpkiLink, "|see>]");
          context.markDownUrl = " [[see](".concat(context.rpkiLink, ")]");
          break;

        case "roa":
          matched = content.data[0].matchedRule;
          context.extra = content.data[0].extra;
          context.asn = (matched.asn || "").toString();
          context.prefix = matched.prefix || content.data[0].matchedMessage.prefix;
          context.description = matched.description || "";
          break;

        case "path-neighbor":
          context.extra = content.data[0].extra;
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description || "";
          context.asn = (matched.asn || "").toString();
          break;

        default:
          matched = content.data[0].matchedRule;
          context.prefix = matched.prefix;
          context.description = matched.description || "";
          context.asn = (matched.asn || "").toString();
      }

      return context;
    } catch (error) {
      // This MUST never happen. But if it happens we need to send a basic alert anyway and don't crash
      _this.logger.log({
        level: 'error',
        message: "It was not possible to generate a context: ".concat(error)
      });

      return {
        summary: content.message
      };
    }
  });

  _defineProperty(this, "parseTemplate", function (template, context) {
    return template.replace(/\${([^}]*)}/g, function (r, k) {
      return context[k];
    });
  });

  _defineProperty(this, "report", function (message, content) {
    throw new Error('The method report must be implemented');
  });

  _defineProperty(this, "getUserGroup", function (group) {
    throw new Error('The method getUserGroup must be implemented');
  });

  this.config = env.config;
  this.logger = env.logger;
  this.pubSub = env.pubSub;
  this.params = params;
  this.enabled = true;

  var _iterator = _createForOfIteratorHelper(channels),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var channel = _step.value;
      env.pubSub.subscribe(channel, function (content, message) {
        return _this.report(message, content);
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  this.axios = (0, _axiosEnrich["default"])(_axios["default"], !this.params.noProxy && env.agent ? env.agent : null, "".concat(env.clientId, "/").concat(env.version));
});

exports["default"] = Report;