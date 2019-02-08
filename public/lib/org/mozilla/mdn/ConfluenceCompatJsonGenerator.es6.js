// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// TODO(markdittmer): Major overlap between this and
// CompatConfluenceJsonGenerator. Refactor to common base class.
foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ConfluenceCompatJsonGenerator',
  implements: ['foam.mlang.Expressions'],

  axioms: [foam.pattern.Multiton.create({property: 'outputDir'})],

  requires: [
    'foam.dao.MDAO',
    'org.mozilla.mdn.CompatJson',
    'org.mozilla.mdn.CompatJsonAdapter',
    'org.mozilla.mdn.generated.ConfluenceRow',
  ],
  imports: [
    'bcd',
    'creationContext',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'fillOnly',
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
      name: 'mdnBuiltins_',
      factory: function() { return this.bcd.javascript.builtins; },
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
        const ConfluenceRow = this.creationContext
                .lookup('org.mozilla.mdn.generated.ConfluenceRow');
        const dao = (this.interfaces.length > 0 ?
                     confluenceDAO.where(this.IN(
                       ConfluenceRow.INTERFACE_NAME,
                       this.interfaces)) :
                     confluenceDAO).orderBy(confluenceDAO.of.ID);
        const confluenceRows = (await dao.select()).array;
        let jsons = {};
        let json;
        let interfaceName;
        const browsers = this.browsers.length > 0 ? this.browsers : null;
        const patchOpts = this.fillOnly ? {
          browsers,
          patchPredicate: (key, base, patch) => {
            // Do not overwrite browser version numbers (which are strings).
            return !foam.String.isInstance(base);
          },
        } : {browsers};
        for (const confluenceRow of confluenceRows) {
          const adapter = this.CompatJsonAdapter.create();

          // Whenever interfaceName changes, store accumulated JSON and
          // get fresh JSON for new interface.
          if (confluenceRow.interfaceName !== interfaceName) {
            if (json) jsons[json.id] = json;
            interfaceName = confluenceRow.interfaceName;
            json = this.getJson_(interfaceName, jsons).fromNpmModule();
          }

          const interfacesJson = json.getInterfacesJson();
          adapter.patchCompatJsonFileFromConfluenceRow(
              interfacesJson, confluenceRow, patchOpts);
        }
        // Store last interface's accumulated JSON.
        jsons[json.id] = json;

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
