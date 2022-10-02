"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _env = _interopRequireDefault(require("../env"));

var _axiosEnrich = _interopRequireDefault(require("../utils/axiosEnrich"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Uptime = /*#__PURE__*/_createClass(function Uptime(_connectors, params) {
  var _this = this;

  _classCallCheck(this, Uptime);

  _defineProperty(this, "getCurrentStatus", function () {
    var connectors = _this.connectors.getConnectors().filter(function (connector) {
      return connector.constructor.name !== "ConnectorSwUpdates";
    }).map(function (connector) {
      return {
        name: connector.constructor.name,
        connected: connector.connected
      };
    });

    var disconnected = connectors.some(function (connector) {
      return !connector.connected;
    });

    var rpki = _env["default"].rpki.getStatus();

    var warning = disconnected || !rpki.data || rpki.stale;
    return {
      warning: warning,
      connectors: connectors,
      rpki: rpki
    };
  });

  this.connectors = _connectors;
  this.params = params;
  this.axios = (0, _axiosEnrich["default"])(_axios["default"], !this.params.noProxy && _env["default"].agent ? _env["default"].agent : null, "".concat(_env["default"].clientId, "/").concat(_env["default"].version));
});

exports["default"] = Uptime;