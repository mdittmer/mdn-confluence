// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatConfluenceJsonGenerator',

  axioms: [foam.pattern.Multiton.create({property: 'outputDir'})],

  requires: [
    'foam.dao.MDAO',
    'org.mozilla.mdn.CompatClassGenerator',
    'org.mozilla.mdn.CompatJson',
    'org.mozilla.mdn.CompatJsonAdapter',
  ],

  properties: [
    {
      class: 'String',
      name: 'outputDir',
    },
    {
      name: 'mdnData_',
      factory: function() { return require('mdn-browser-compat-data'); },
    },
    {
      name: 'mdnApis_',
      factory: function() { return this.mdnData_.api; },
    },
    {
      name: 'mdnBuiltins_',
      factory: function() { return this.mdnData_.javascript.builtins; },
    },
    {
      name: 'fs_',
      factory: function() { return require('fs'); },
    },
  ],

  methods: [
    {
      name: 'generateJson',
      code: (async function(confluenceDAO) {
        this.ensureDirs_();
        const getBrowserName = this.CompatClassGenerator
              .getAxiomByName('browserNameFromMdnKey').code;

        let jsons = {};
        const ifaces = Object.assign(
            {}, this.mdnApis_, this.mdnBuiltins_);
        for (const iface of Object.keys(ifaces)) {
          if (iface.indexOf('__') !== -1) continue;
          for (const api of Object.keys(ifaces[iface])) {
            if (/[^a-z]/i.test(api) ||
                !(ifaces[iface][api].__compat &&
                  ifaces[iface][api].__compat.support)) {
              continue;
            }
            const confluenceRow = await confluenceDAO.find(`${iface}#${api}`);
            if (!confluenceRow) continue;
            const adapter = this.CompatJsonAdapter.create();
            const json = this.getJson_(confluenceRow.interfaceName, jsons)
                  .fromNpmModule();
            const confluenceSupport =
                  adapter.confluenceRowToCompatJsonFragment(confluenceRow);
            const compatSupport = ifaces[iface][api].__compat.support;
            // const interfacesJson = json.getInterfacesJson();
            // adapter.patch(interfacesJson[iface][api], ifaces[iface][api]);
            // adapter.patchCompatJsonFileFromConfluenceRow(interfacesJson,
            //                                              confluenceRow);

            const keys = Object.keys(compatSupport);
            for (const key of keys) {
              if (confluenceSupport[key]) {
                const baseSupport =
                      json.getInterfacesJson()[iface][api].__compat.support;
                foam.assert(baseSupport[key],
                            `Missing base ${key} support for ${iface}#${api}`);
                adapter.patch(baseSupport[key], confluenceSupport[key]);
              }
            }

            jsons[json.id] = json;
          }
        }

        let promises = [];
        for (const id of Object.keys(jsons)) {
          const json = jsons[id];
          promises.push(this.writeFile_(
              `${this.outputDir}/${json.compatDir}/${json.interfaceName}.json`,
              JSON.stringify(json.json, null, 2)));
        }

        return Promise.all(promises);
      }),
    },
    {
      name: 'getJson_',
      code: function(interfaceName, jsons) {
        let json;
        if (this.mdnBuiltins_[interfaceName]) {
          json = this.CompatJson.create({
            compatDir: 'javascript/builtins',
            interfaceName,
          });
        } else {
          json = this.CompatJson.create({
            compatDir: 'api',
            interfaceName,
          });
        }

        if (jsons[json.id]) return jsons[json.id];
        return json;
      },
    },
    {
      name: 'ensureDirs_',
      code: function() {
        this.ensureDir_(`${this.outputDir}/api`);
        this.ensureDir_(`${this.outputDir}/javascript`);
        this.ensureDir_(`${this.outputDir}/javascript/builtins`);
      },
    },
    {
      name: 'ensureDir_',
      code: function(path) {
        if (!this.fs_.existsSync(path))
          this.fs_.mkdirSync(path);
      },
    },
    {
      name: 'writeFile_',
      code: function(path, data) {
        return new Promise(
            (resolve, reject) => this.fs_.writeFile(path, data,
                                                    err => err ?
                                                    reject(err) :
                                                    resolve()));
      },
    },
  ],
});
