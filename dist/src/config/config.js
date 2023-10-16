"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _axios = _interopRequireDefault(require("axios"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Config = exports["default"] = /*#__PURE__*/_createClass(function Config(params) {
  _classCallCheck(this, Config);
  _defineProperty(this, "downloadDefault", function () {
    return (0, _axios["default"])({
      url: 'https://raw.githubusercontent.com/nttgin/BGPalerter/main/config.yml.example',
      method: 'GET',
      responseType: 'blob' // important
    }).then(function (response) {
      return response.data;
    });
  });
  _defineProperty(this, "retrieve", function () {
    throw new Error('The method retrieve must be implemented in the config connector');
  });
  _defineProperty(this, "save", function () {
    throw new Error('The method save must be implemented in the config connector');
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
        skipPrefixMatchOnDifferentGroups: false,
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
        toleranceDeletedRoasTA: 20,
        toleranceExpiredRoasTA: 20
      }
    }, {
      file: "monitorPathNeighbors",
      channel: "hijack",
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
      preCacheROAs: true,
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
_defineProperty(Config, "configVersion", 2);