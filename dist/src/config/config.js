"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _redaxios = _interopRequireDefault(require("redaxios"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Config = exports["default"] = /*#__PURE__*/_createClass(function Config(params) {
  _classCallCheck(this, Config);
  _defineProperty(this, "downloadDefault", function () {
    return (0, _redaxios["default"])({
      url: "https://raw.githubusercontent.com/nttgin/BGPalerter/main/config.yml.example",
      method: "GET",
      responseType: "blob" // important
    }).then(function (response) {
      return response.data;
    });
  });
  _defineProperty(this, "retrieve", function () {
    throw new Error("The method retrieve must be implemented in the config connector");
  });
  _defineProperty(this, "save", function () {
    throw new Error("The method save must be implemented in the config connector");
  });
  this["default"] = {
    configVersion: Config.configVersion,
    environment: "production",
    connectors: [{
      file: "connectorRIS",
      name: "ris",
      params: {
        carefulSubscription: true,
        url: "ws://ris-live.ripe.net/v1/ws/",
        perMessageDeflate: true,
        subscription: {
          moreSpecific: true,
          type: "UPDATE",
          host: null,
          socketOptions: {
            includeRaw: false
          }
        }
      }
    }
    // {
    //     file: "connectorRISDump",
    //     name: "dmp"
    // }
    ],
    monitors: [{
      file: "monitorHijack",
      channel: "hijack",
      name: "basic-hijack-detection",
      params: {
        thresholdMinPeers: 3
      }
    }, {
      file: "monitorPath",
      channel: "path",
      name: "path-matching",
      params: {
        thresholdMinPeers: 1
      }
    }, {
      file: "monitorNewPrefix",
      channel: "newprefix",
      name: "prefix-detection",
      params: {
        thresholdMinPeers: 3
      }
    }, {
      file: "monitorVisibility",
      channel: "visibility",
      name: "withdrawal-detection",
      params: {
        thresholdMinPeers: 40,
        notificationIntervalSeconds: 3600
      }
    }, {
      file: "monitorAS",
      channel: "misconfiguration",
      name: "asn-monitor",
      params: {
        skipPrefixMatch: false,
        thresholdMinPeers: 3
      }
    }, {
      file: "monitorRPKI",
      channel: "rpki",
      name: "rpki-monitor",
      params: {
        thresholdMinPeers: 3,
        checkUncovered: false,
        checkDisappearing: false
      }
    }, {
      file: "monitorROAS",
      channel: "rpki",
      name: "rpki-diff",
      params: {
        enableDiffAlerts: true,
        enableExpirationAlerts: true,
        enableExpirationCheckTA: true,
        enableDeletedCheckTA: true,
        enableAdvancedRpkiStats: false,
        roaExpirationAlertHours: 2,
        checkOnlyASns: true,
        toleranceDeletedRoasTA: {
          ripe: 20,
          apnic: 20,
          arin: 20,
          lacnic: 20,
          afrinic: 50
        },
        toleranceExpiredRoasTA: {
          ripe: 20,
          apnic: 20,
          arin: 20,
          lacnic: 20,
          afrinic: 50
        }
      }
    }, {
      file: "monitorPathNeighbors",
      channel: "path",
      name: "path-neighbors",
      params: {
        thresholdMinPeers: 3
      }
    }],
    reports: [{
      file: "reportFile",
      channels: ["hijack", "newprefix", "visibility", "path", "misconfiguration", "rpki"]
    }],
    notificationIntervalSeconds: 86400,
    alarmOnlyOnce: false,
    monitoredPrefixesFiles: ["prefixes.yml"],
    persistStatus: true,
    generatePrefixListEveryDays: 0,
    logging: {
      directory: "logs",
      logRotatePattern: "YYYY-MM-DD",
      maxRetainedFiles: 10,
      maxFileSizeMB: 15,
      compressOnRotation: false
    },
    rpki: {
      vrpProvider: "rpkiclient",
      refreshVrpListMinutes: 15,
      markDataAsStaleAfterMinutes: 120
    },
    rest: {
      host: "localhost",
      port: 8011
    },
    checkForUpdatesAtBoot: true,
    pidFile: "bgpalerter.pid",
    fadeOffSeconds: 360,
    checkFadeOffGroupsSeconds: 30
  };
});
_defineProperty(Config, "configVersion", 3);