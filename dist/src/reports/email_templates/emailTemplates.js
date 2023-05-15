"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
                                                                                                                                                                                                                                                                                                                                                                                               * 	BSD 3-Clause License
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Copyright (c) 2019, NTT Ltd.
                                                                                                                                                                                                                                                                                                                                                                                               * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                               * modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               *  Redistributions of source code must retain the above copyright notice, this
                                                                                                                                                                                                                                                                                                                                                                                               *   list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               *  Redistributions in binary form must reproduce the above copyright notice,
                                                                                                                                                                                                                                                                                                                                                                                               *   this list of conditions and the following disclaimer in the documentation
                                                                                                                                                                                                                                                                                                                                                                                               *   and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               *  Neither the name of the copyright holder nor the names of its
                                                                                                                                                                                                                                                                                                                                                                                               *   contributors may be used to endorse or promote products derived from
                                                                                                                                                                                                                                                                                                                                                                                               *   this software without specific prior written permission.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                               * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                               * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
                                                                                                                                                                                                                                                                                                                                                                                               * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
                                                                                                                                                                                                                                                                                                                                                                                               * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
                                                                                                                                                                                                                                                                                                                                                                                               * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
                                                                                                                                                                                                                                                                                                                                                                                               * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
                                                                                                                                                                                                                                                                                                                                                                                               * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
                                                                                                                                                                                                                                                                                                                                                                                               * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
                                                                                                                                                                                                                                                                                                                                                                                               * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                               */
var templateHijack = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Monitored prefix:     ${prefix}\n\
Prefix Description:   ${description}\n\
Usually announced by: ${asn}\n\
Event type:           ${type}\n\
Now announced by:     ${neworigin}\n\
Now announced with:   ${newprefix}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
Detected by peers:    ${peers}\n\
See in BGPlay:        ${bgplay}\n\
\n\
Top ${pathNumber} most used AS paths:\n\
${paths}';
var templateNewPrefix = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Monitored prefix:     ${prefix}\n\
Prefix Description:   ${description}\n\
Usually announced by: ${asn}\n\
Event type:           ${type}\n\
Detected new prefix:  ${newprefix}\n\
Announced by:         ${neworigin}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
Detected by peers:    ${peers}\n\
See in BGPlay:        ${bgplay}';
var templatePath = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Event type:           ${type}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
\n\
\n\
Top ${pathNumber} triggering AS paths:\n\
${paths}';
var templateSoftwareUpdate = '${summary}';
var templateVisibility = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Monitored prefix:     ${prefix}\n\
Prefix Description:   ${description}\n\
Prefix origin:        ${asn}\n\
Event type:           ${type}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
Detected by peers:    ${peers}\n\
See in BGPlay:        ${bgplay}';
var templateMisconfiguration = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Event type:           ${type}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
\n\
\n\
Top ${pathNumber} most used AS paths:\n\
${paths}';
var templateRPKI = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Event type:           ${type}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC\n\
See:                  ${rpkiLink}';
var templateRoa = '${summary}\n\
\n\
\n\
DETAILS:\n\
------------------------------------------------------\n\
Event type:           ${type}\n\
When event started:   ${earliest} UTC\n\
Last event:           ${latest} UTC';
var defaultTemplate = '${summary}';
var emailTemplates = /*#__PURE__*/_createClass(function emailTemplates(logger) {
  var _this = this;
  _classCallCheck(this, emailTemplates);
  _defineProperty(this, "getTemplate", function (channel) {
    return _this.indexedFiles[channel] || defaultTemplate;
  });
  var directory = 'src/reports/email_templates/';
  var templateFiles = [{
    channel: 'hijack',
    content: templateHijack
  }, {
    channel: 'newprefix',
    content: templateNewPrefix
  }, {
    channel: 'path',
    content: templatePath
  }, {
    channel: 'software-update',
    content: templateSoftwareUpdate
  }, {
    channel: 'visibility',
    content: templateVisibility
  }, {
    channel: 'misconfiguration',
    content: templateMisconfiguration
  }, {
    channel: 'rpki',
    content: templateRPKI
  }, {
    channel: 'roa',
    content: templateRoa
  }];
  this.indexedFiles = {};
  if (!_fs["default"].existsSync(directory)) {
    _fs["default"].mkdirSync(directory, {
      recursive: true
    });
  }
  templateFiles.forEach(function (template) {
    try {
      var file = _path["default"].resolve(directory, template.channel + '.txt');
      if (_fs["default"].existsSync(file)) {
        _this.indexedFiles[template.channel] = _fs["default"].readFileSync(file, 'utf8');
      } else {
        _fs["default"].writeFileSync(file, template.content);
        _this.indexedFiles[template.channel] = template.content;
      }
    } catch (error) {
      logger.log({
        level: 'error',
        message: 'Email template: ' + error
      });
    }
  });
});
exports["default"] = emailTemplates;
;