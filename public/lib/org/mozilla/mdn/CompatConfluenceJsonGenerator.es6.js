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
  imports: ['bcd'],

  properties: [
    {
      class: 'Boolean',
      name: 'fillOnly',
    },
    {
      class: 'Boolean',
      name: 'remove',
    },
    {
      class: 'String',
      name: 'outputDir',
    },
    {
      class: 'Array',
      of: 'String',
      name: 'interfaces',
    },
    {
      class: 'Array',
      of: 'String',
      name: 'browsers',
    },
    {
      name: 'mdnApis_',
      factory: function() { return this.bcd.api; },
    },
    {
      name: 'mdnBuiltins_',
      factory: function() { return this.bcd.javascript.builtins; },
    },
    {
      name: 'compareVersions_',
      factory: function() { return require('compare-versions'); },
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

        const patchOpts = {
          patchPredicate: (key, base, patch) => {
            if (!this.remove) {
              // When not asked to trust removals, don't add `version_removed`
              // or increase `version_added`.
              if (key === 'version_removed') {
                return false;
              }

              if (key === 'version_added' &&
                  foam.String.isInstance(base) &&
                  foam.String.isInstance(patch) &&
                  this.compareVersions_(base, patch) < 0) {
                return false;
              }
            }

            if (this.fillOnly) {
              // Do not overwrite browser version numbers (which are strings).
              return !foam.String.isInstance(base);
            }

            return true;
          }
        };

        let jsons = {};
        const ifaces = Object.assign(
            {}, this.mdnApis_, this.mdnBuiltins_);
        const ifaceKeys = this.interfaces.length > 0 ?
            this.interfaces.filter(str => !!ifaces[str]) :
            Object.keys(ifaces);
        for (const iface of ifaceKeys) {
          if (iface.indexOf('__') !== -1) continue;

          const json = this.getJson_(iface, jsons).fromNpmModule();
          const interfacesJson = json.getInterfacesJson();

          // Get list of legitimate APIs. If none, continue.
          const apiKeys = Object.keys(ifaces[iface])
              .filter(api => !(/[^a-z]/i.test(api) ||
                               !(ifaces[iface][api].__compat &&
                                 ifaces[iface][api].__compat.support)));
          if (apiKeys.length === 0) continue;

          for (const api of apiKeys) {
            const confluenceRow = await confluenceDAO.find(`${iface}#${api}`);
            if (!confluenceRow) continue;
            const adapter = this.CompatJsonAdapter.create();
            const compatSupport = ifaces[iface][api].__compat.support;
            const confluenceSupport = adapter.confluenceRowToCompatJsonFragment(
                confluenceRow, {existing: compatSupport});

            const keys = this.browsers.length === 0 ?
                Object.keys(compatSupport) :
                Object.keys(compatSupport)
                    .filter(key => this.browsers.includes(key));
            for (const key of keys) {
              if (confluenceSupport[key]) {
                const baseSupport = interfacesJson[iface][api].__compat.support;
                foam.assert(baseSupport[key],
                            `Missing base ${key} support for ${iface}#${api}`);
                adapter.patch(baseSupport[key], confluenceSupport[key],
                              patchOpts);
              }
            }
          }

          jsons[json.id] = json;
        }

        let promises = [];
        for (const id of Object.keys(jsons)) {
          const json = jsons[id];
          promises.push(this.writeFile_(
              `${this.outputDir}/${json.compatDir}/${json.interfaceName}.json`,
              JSON.stringify(json.json, null, 2) + '\n'));
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
