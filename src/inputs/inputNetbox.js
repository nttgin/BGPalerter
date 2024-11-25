/*
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

import axios from "redaxios";
import Input from "./input";
import ipUtils from "ip-sub";
import { AS } from "../model";

export default class InputNetbox extends Input {
  constructor(env) {
    super(env);
    this.prefixes = [];
    this.asns = [];
    this.options = {};
    this.watcherSet = false;

    if (!this.config.inputNetbox) {
      throw new Error("The inputNetbox key is missing in the config file");
    }

    this.axios = axios.create({
      baseURL: this.config.inputNetbox.url,
      headers: {
        Authorization: `Token ${this.config.inputNetbox.token}`,
      },
    });

    this._scheduleRefresh();
  }

  getMonitoredMoreSpecifics = () => {
    return this.prefixes.filter((p) => !p.ignoreMorespecifics);
  };

  getMonitoredPrefixes = () => {
    return this.prefixes;
  };

  getMonitoredASns = () => {
    return this.asns;
  };

  save = (content) => new Promise((resolve, reject) => resolve());

  _scheduleRefresh = () => {
    setTimeout(
      () => {
        this.loadPrefixes()
        .then(() => {
          this._change();
          this._scheduleRefresh();
        })
        .catch(error => {
          console.log("Netbox error", error);
        });
      },
      this.config.inputNetbox.refreshIntervalSeconds * 1000,
    );

  }

  loadPrefixes = () => {
    console.log("Netbox: loading prefixes");

    const newPrefixes = [];
    const newASns = new Set();

    const queries = [];
    for (let queryCfg of this.config.inputNetbox.queries) {
      queryCfg.asn.forEach((as) => newASns.add(as));

      queries.push(
        this._fetchQuery(queryCfg)
          .then((res) => {
            res.data.results.forEach((prefix) =>
              newPrefixes.push({
                prefix: prefix.prefix,
                description: prefix.description,
                asn: queryCfg.asn,
                group: ["default"],
                ignore: false,
                excludeMonitors: [],
                includeMonitors: [],
              })
            );
          })
          .catch((err) =>
            console.log(
              `Netbox error: fetch ${JSON.stringify(queryCfg.params)}: ${err}`
            )
          )
      );
    }

    return Promise.all(queries).then(() => {
      newPrefixes.sort((a, b) => {
        return ipUtils.sortByPrefixLength(b.prefix, a.prefix);
      });

      this.prefixes = newPrefixes;
      this.asns = Array.from(newASns).map((asn) => ({
        asn: new AS(asn),
        group: ["default"],
      }));
    });
  };

  retrieve = () => {
    console.log("Netbox: retrieving prefixes");

    new Promise((resolve, reject) => {
      const prefixes = {};
      const monitorASns = {};

      for (let rule of this.prefixes) {
        const item = JSON.parse(JSON.stringify(rule));
        prefixes[rule.prefix] = item;
        item.asn = rule.asn.getValue();
        delete item.prefix;
        if (!item.includeMonitors.length) {
          delete item.includeMonitors;
        }
        if (!item.excludeMonitors.length) {
          delete item.excludeMonitors;
        }
      }

      for (let asnRule of this.asns) {
        monitorASns[asnRule.asn.getValue()] = {
          group: [asnRule.group].flat(),
          upstreams: asnRule.upstreams ? asnRule.upstreams.numbers : null,
          downstreams: asnRule.downstreams ? asnRule.downstreams.numbers : null,
        };
      }

      const options = Object.assign({}, this.options, { monitorASns });

      resolve({ ...prefixes, options });
    });
  };

  _fetchQuery = (queryCfg) => {
    console.log(`Netbox: fetching ${JSON.stringify(queryCfg.params)}`);

    return this.axios.get("/api/ipam/prefixes/", {
      params: queryCfg.params,
    });
  };
}
