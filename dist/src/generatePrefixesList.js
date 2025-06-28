"use strict";

var _redaxios = _interopRequireDefault(require("redaxios"));
var _brembo = _interopRequireDefault(require("brembo"));
var _deepmerge = _interopRequireDefault(require("deepmerge"));
var _batchPromises = _interopRequireDefault(require("batch-promises"));
var _rpkiValidator = _interopRequireDefault(require("rpki-validator"));
var _model = require("./model");
var _ipSub = _interopRequireDefault(require("ip-sub"));
var _axiosEnrich = _interopRequireDefault(require("./utils/axiosEnrich"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var apiTimeout = 120000;
var clientId = "ntt-bgpalerter";
module.exports = function generatePrefixes(inputParameters) {
  var asnList = inputParameters.asnList,
    exclude = inputParameters.exclude,
    excludeDelegated = inputParameters.excludeDelegated,
    prefixes = inputParameters.prefixes,
    monitoredASes = inputParameters.monitoredASes,
    debug = inputParameters.debug,
    historical = inputParameters.historical,
    group = inputParameters.group,
    append = inputParameters.append,
    logger = inputParameters.logger,
    getCurrentPrefixesList = inputParameters.getCurrentPrefixesList,
    enriched = inputParameters.enriched,
    upstreams = inputParameters.upstreams,
    downstreams = inputParameters.downstreams;
  var rpki = new _rpkiValidator["default"]({
    defaultRpkiApi: null,
    clientId: clientId
  });
  exclude = exclude || [];
  logger = logger || console.log;
  group = group || "noc";
  var generateList = {};
  var someNotValidatedPrefixes = false;
  (0, _axiosEnrich["default"])(_redaxios["default"], clientId);
  if (historical) {
    logger("WARNING: you are using historical visibility data for generating the prefix list.");
  }
  if (!asnList && !prefixes) {
    throw new Error("You need to specify at least an AS number or a list of prefixes.");
  }
  if (asnList && prefixes) {
    throw new Error("You can specify an AS number or a list of prefixes, not both.");
  }
  if (asnList && Array.isArray(asnList) && asnList.length) {
    asnList = asnList.map(function (i) {
      return i.replace("AS", "");
    });
    if (asnList.some(function (i) {
      return !new _model.AS([i]).isValid();
    })) {
      throw new Error("One of the AS number is not valid");
    }
  }
  if (monitoredASes && Array.isArray(monitoredASes) && monitoredASes.length) {
    monitoredASes = monitoredASes.map(function (i) {
      return i.replace("AS", "");
    });
    if (monitoredASes.some(function (i) {
      return !new _model.AS([i]).isValid();
    })) {
      throw new Error("One of the AS number is not valid");
    }
  }
  var getNeighbors = function getNeighbors(asn) {
    var url = _brembo["default"].build("https://stat.ripe.net", {
      path: ["data", "asn-neighbours", "data.json"],
      params: {
        client: clientId,
        resource: asn,
        lod: 0,
        data_overload_limit: "ignore"
      }
    });
    if (debug) {
      logger("Query", url);
    }
    return (0, _redaxios["default"])({
      url: url,
      method: "GET",
      responseType: "json",
      timeout: apiTimeout
    }).then(function (data) {
      var neighbors = [];
      if (data.data && data.data.data && data.data.data.neighbours) {
        var items = data.data.data.neighbours;
        var _iterator = _createForOfIteratorHelper(items),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var item = _step.value;
            if (item.type === "left" || item.type === "right") {
              neighbors.push({
                asn: item.asn,
                type: item.type
              });
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      var uncertain = neighbors.filter(function (i) {
        return i.type === "uncertain";
      });
      var out = {
        asn: asn,
        upstreams: neighbors.filter(function (i) {
          return i.type === "left";
        }).concat(uncertain).map(function (i) {
          return i.asn;
        }),
        downstreams: neighbors.filter(function (i) {
          return i.type === "right";
        }).concat(uncertain).map(function (i) {
          return i.asn;
        })
      };
      logger("Detected upstreams for ".concat(out.asn, ": ").concat(out.upstreams.join(", ")));
      logger("Detected downstreams for ".concat(out.asn, ": ").concat(out.downstreams.join(", ")));
      return out;
    })["catch"](function (error) {
      logger(error);
      logger("RIPEstat asn-neighbours query failed: cannot retrieve information for ".concat(asn));
    });
  };
  var getMultipleOrigins = function getMultipleOrigins(prefix) {
    var url = _brembo["default"].build("https://stat.ripe.net", {
      path: ["data", "prefix-overview", "data.json"],
      params: {
        min_peers_seeing: 0,
        client: clientId,
        resource: prefix,
        data_overload_limit: "ignore"
      }
    });
    if (debug) {
      logger("Query", url);
    }
    return (0, _redaxios["default"])({
      url: url,
      method: "GET",
      responseType: "json",
      timeout: apiTimeout
    }).then(function (data) {
      var asns = [];
      if (data.data && data.data.data && data.data.data.asns) {
        asns = data.data.data.asns.map(function (i) {
          return i.asn;
        });
      }
      return asns;
    })["catch"](function (error) {
      logger(error);
      logger("RIPEstat prefix-overview query failed: cannot retrieve information for ".concat(prefix));
    });
  };
  var getAnnouncedMoreSpecifics = function getAnnouncedMoreSpecifics(prefix) {
    logger("Generating monitoring rule for ".concat(prefix));
    var url = _brembo["default"].build("https://stat.ripe.net", {
      path: ["data", "related-prefixes", "data.json"],
      params: {
        client: clientId,
        resource: prefix,
        data_overload_limit: "ignore"
      }
    });
    if (debug) {
      logger("Query ".concat(url));
    }
    return (0, _redaxios["default"])({
      url: url,
      method: "GET",
      responseType: "json",
      timeout: apiTimeout
    }).then(function (data) {
      var prefixes = [];
      if (data.data && data.data.data && data.data.data.prefixes) {
        prefixes = data.data.data.prefixes.filter(function (i) {
          return i.relationship === "Overlap - More Specific";
        }).map(function (i) {
          logger("Detected more specific ".concat(i.prefix));
          return {
            asn: i.origin_asn,
            description: i.asn_name,
            prefix: i.prefix
          };
        });
      }
      return prefixes;
    })["catch"](function () {
      logger("RIPEstat related-prefixes query failed: cannot retrieve information for ".concat(prefix));
    });
  };
  var generateRule = function generateRule(prefix, asn, ignoreMorespecifics, description, excludeDelegated) {
    return getMultipleOrigins(prefix).then(function (asns) {
      var origins = asn ? [parseInt(asn)] : [];
      if (asns && Array.isArray(asns) && asns.length) {
        origins = asns.map(function (i) {
          return parseInt(i);
        });
      } else {
        logger("RIPEstat is having issues in returning the origin ASes of some prefixes. The prefix.yml configuration may be incomplete.");
      }
      if (origins.length) {
        generateList[prefix] = generateList[prefix] || {
          description: description || "No description provided",
          asn: origins,
          ignoreMorespecifics: ignoreMorespecifics,
          ignore: excludeDelegated,
          group: group
        };
      }
    });
  };
  var getAnnouncedPrefixes = function getAnnouncedPrefixes(asn) {
    var url = _brembo["default"].build("https://stat.ripe.net", {
      path: ["data", "announced-prefixes", "data.json"],
      params: {
        client: clientId,
        resource: asn,
        data_overload_limit: "ignore"
      }
    });
    logger("Getting announced prefixes of AS".concat(asn));
    if (debug) {
      logger("Query ".concat(url));
    }
    return (0, _redaxios["default"])({
      url: url,
      method: "GET",
      responseType: "json",
      timeout: apiTimeout
    }).then(function (data) {
      if (data.data && data.data.data && data.data.data.prefixes) {
        return data.data.data.prefixes.filter(function (item) {
          var latest = item.timelines.map(function (t) {
            return t.endtime ? new Date(t.endtime) : new Date();
          }).sort(function (a, b) {
            return a - b;
          }).pop();
          var validityPeriodDays = historical ? 3600 * 1000 * 24 * 7 :
          // 7 days
          3600 * 1000 * 28; // 28 hours (1 day and 4 hours margin)
          return latest.getTime() + validityPeriodDays > new Date().getTime();
        });
      }
      return [];
    }).then(function (list) {
      if (list.length === 0) {
        logger("WARNING: no announced prefixes were detected for AS".concat(asn, ". If you are sure the AS provided is announcing at least one prefix, this could be an issue with the data source (RIPEstat). Try to run the generate command with the option -H."));
      }
      return list;
    }).then(function (list) {
      return list.filter(function (i) {
        return !exclude.some(function (excluded) {
          return _ipSub["default"].isEqualPrefix(excluded, i.prefix);
        });
      });
    }).then(function (list) {
      return (0, _batchPromises["default"])(40, list, function (i) {
        return generateRule(i.prefix, asn, false, null, false);
      }).then(function () {
        return list.map(function (i) {
          return i.prefix;
        });
      });
    });
  };
  var validatePrefix = function validatePrefix(asn, prefix) {
    return rpki.validate(prefix, asn, false).then(function (isValid) {
      if (enriched) {
        generateList[prefix].valid = isValid;
      }
      if (isValid === true) {
        // All good
      } else if (isValid === false) {
        delete generateList[prefix];
        logger("RPKI invalid: ".concat(prefix, " ").concat(asn));
      } else {
        generateList[prefix].description += " (No ROA available)";
        someNotValidatedPrefixes = true;
      }
    })["catch"](function (error) {
      logger("RPKI validation query failed: cannot retrieve information for ".concat(prefix));
    });
  };
  var getBaseRules = function getBaseRules(prefixes) {
    if (prefixes) {
      return (0, _batchPromises["default"])(40, prefixes, function (p) {
        return generateRule(p, null, false, null, false);
      }).then(function () {
        return prefixes;
      });
    } else {
      var _prefixes = [];
      return (0, _batchPromises["default"])(1, asnList, function (asn) {
        return getAnnouncedPrefixes(asn)["catch"](function (error) {
          logger("It was not possible to retrieve the announced prefixes of ".concat(asn, ". ").concat(error));
          return _prefixes;
        }).then(function (plist) {
          return _prefixes = _prefixes.concat(plist);
        });
      }).then(function () {
        logger("Total prefixes detected: ".concat(_prefixes.length));
        return _prefixes;
      });
    }
  };
  return getBaseRules(prefixes).then(function (items) {
    return items.flat();
  }).then(function (prefixes) {
    return (0, _batchPromises["default"])(1, prefixes, function (prefix) {
      return getAnnouncedMoreSpecifics(prefix).then(function (items) {
        return (0, _batchPromises["default"])(1, items, function (item) {
          return generateRule(item.prefix, item.asn, true, item.description, excludeDelegated);
        });
      })["catch"](function (e) {
        logger("Cannot download more specific prefixes of ".concat(prefix, " ").concat(e));
      });
    })["catch"](function (e) {
      logger("Cannot download more specific prefixes ".concat(e));
    });
  }).then(function () {
    return rpki.getAvailableConnectors().then(function (connectors) {
      return rpki.setConnector(connectors[0]);
    })["catch"](function () {
      return rpki.preCache();
    });
  }).then(function () {
    // Check
    return Promise.all(Object.keys(generateList).map(function (prefix) {
      return validatePrefix(generateList[prefix].asn[0], prefix);
    }))["catch"](function (e) {
      logger("ROA check failed due to error ".concat(e));
    });
  }).then(function () {
    // Add the options for monitorASns

    var generateMonitoredAsObject = function generateMonitoredAsObject(list, asnNeighbors) {
      generateList.options = generateList.options || {};
      generateList.options.monitorASns = generateList.options.monitorASns || {};
      var _iterator2 = _createForOfIteratorHelper(list),
        _step2;
      try {
        var _loop = function _loop() {
          var monitoredAs = _step2.value;
          logger("Generating generic monitoring rule for AS".concat(monitoredAs));
          var neighbors = asnNeighbors.filter(function (i) {
            return i.asn.toString() === monitoredAs.toString();
          });
          generateList.options.monitorASns[monitoredAs] = {
            group: group,
            upstreams: upstreams && neighbors.length ? neighbors[0].upstreams : null,
            downstreams: downstreams && neighbors.length ? neighbors[0].downstreams : null
          };
        };
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    };
    var createASesRules = [];
    if (monitoredASes === true) {
      createASesRules = asnList;
    } else if (monitoredASes.length) {
      createASesRules = monitoredASes;
    }
    if (asnList && Array.isArray(asnList) && asnList.length) {
      return (0, _batchPromises["default"])(1, asnList, getNeighbors).then(function (asnNeighbors) {
        generateMonitoredAsObject(createASesRules, asnNeighbors);
      });
    }
    // Otherwise nothing
  }).then(function () {
    if (someNotValidatedPrefixes) {
      logger("WARNING: the generated configuration is a snapshot of what is currently announced. Some of the prefixes don't have ROA objects associated. Please, verify the config file by hand!");
    }
  }).then(function () {
    generateList.options = generateList.options || {};
    generateList.options.generate = {
      exclude: exclude,
      excludeDelegated: excludeDelegated,
      monitoredASes: monitoredASes,
      historical: historical,
      group: group
    };
    if (asnList) {
      generateList.options.generate.asnList = asnList;
    }
    if (prefixes) {
      generateList.options.generate.prefixes = prefixes;
    }
    return append ? getCurrentPrefixesList().then(function (current) {
      return (0, _deepmerge["default"])(current, generateList, {
        arrayMerge: function arrayMerge(destinationArray, sourceArray) {
          return _toConsumableArray(new Set([].concat(_toConsumableArray(destinationArray), _toConsumableArray(sourceArray))));
        }
      });
    }) : generateList;
  })["catch"](function (e) {
    logger("Something went wrong ".concat(e));
  });
};