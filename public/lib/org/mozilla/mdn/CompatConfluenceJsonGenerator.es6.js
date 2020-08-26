// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatConfluenceJsonGenerator',

  axioms: [foam.pattern.Multiton.create({property: 'outputDir'})],

  requires: [
    'org.mozilla.mdn.CompatJson',
    'org.mozilla.mdn.CompatJsonAdapter',
  ],

  properties: [
    {
      class: 'String',
      name: 'bcdModule',
    },
    {
      class: 'String',
      name: 'confluenceReleaseUrl',
    },
    {
      class: 'String',
      name: 'confluenceDataUrl',
    },
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
      name: 'bcd_',
      factory: function() {
        // Resolve any relative path.
        return /\.\//.test(this.bcdModule) ?
            require(require('path').resolve(this.bcdModule)) :
            require(this.bcdModule);
      },
    },
    {
      name: 'mdnApis_',
      factory: function() { return this.bcd_.api; },
    },
    {
      name: 'mdnBrowsers_',
      factory: function() { return this.bcd_.browsers; },
    },
    {
      name: 'mdnBuiltins_',
      factory: function() { return this.bcd_.javascript.builtins; },
    },
    {
      name: 'compareVersions_',
      factory: function() { return require('compare-versions'); },
    },
    {
      name: 'fetch_',
      factory: function() { return require('node-fetch'); },
    },
    {
      name: 'fs_',
      factory: function() { return require('fs'); },
    },
  ],

  methods: [
    {
      name: 'generateJson',
      code: (async function() {
        // Load and preprocess the Confluence data. The rows have a list of
        // booleans in the same order as the releases.
        const confluenceReleases = await this.fetchJson_(this.confluenceReleaseUrl);
        const confluenceData = await this.fetchJson_(this.confluenceDataUrl);
        // This will be the list of releases in BCD we have data for and that we
        // should try to update, taking the --browsers arg into account.
        const releases = [];
        confluenceReleases.forEach((confluenceRelease, columnIndex) => {
          const [browser, version] = this.getMdnBrowserRelease_(confluenceRelease);
          if (!browser || !version) {
            return;
          }
          if (this.browsers && this.browsers.length && !this.browsers.includes(browser)) {
            return;
          }
          // Add or update an entry in |releases|. One entry can end up with
          // multiple Confluence releases attached to it.
          let release = releases.find(r => r.browser === browser && r.version === version);
          if (!release) {
            release = {browser, version, confluence: []};
            releases.push(release);
          }
          release.confluence.push(Object.assign({columnIndex}, confluenceRelease));
        });
        // Sort by version. It doesn't matter if browsers are interleaved.
        releases.sort((a, b) => this.compareVersions_(a.version, b.version));

        this.ensureDirs_();

        const patchOpts = {
          patchPredicate: (base, patch) => {
            if (!this.remove) {
              // When not asked to trust removals...
              if ('version_removed' in patch) {
                // don't add `version_removed`,
                return false;
              }

              if ('version_added' in patch) {
                if (base.version_added && !patch.version_added) {
                  // don't change `version_added` from true/string to false/null,
                  return false;
                }
                if (typeof base.version_added === 'string' &&
                    typeof patch.version_added === 'string' &&
                    this.compareVersions_.compare(
                      base.version_added.replace('≤', ''),
                      patch.version_added.replace('≤', ''), '<=')) {
                  // and don't increase `version_added` or add only '≤'.
                  return false;
                }
              }
            }

            if (this.fillOnly) {
              // Only update `version_added` from falsy to truthy.
              return !base.version_added && patch.version_added;
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

          const json = this.getJson_(iface, jsons).fromNpmModule(this.bcd_);
          const interfacesJson = json.getInterfacesJson();

          // Get list of legitimate APIs. If none, continue.
          const apiKeys = Object.keys(ifaces[iface])
              .filter(api => !(/[^a-z]/i.test(api) ||
                               !(ifaces[iface][api].__compat &&
                                 ifaces[iface][api].__compat.support)));
          if (apiKeys.length === 0) continue;

          for (const api of apiKeys) {
            const confluenceRow = confluenceData.find(r => r.id === `${iface}#${api}`);
            if (!confluenceRow) continue;
            const adapter = this.CompatJsonAdapter.create();
            const compatSupport = ifaces[iface][api].__compat.support;
            const confluenceSupport = adapter.confluenceRowToCompatJsonFragment(
                confluenceRow, releases);
            for (const key in compatSupport) {
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
      name: 'getMdnBrowserRelease_',
      code: function(release) {
        const {browserName, browserVersion, osName, osVersion} = release;

        // Map browser + OS to an MDN/BCD browser identifier. Only use one desktop
        // OS for each browser, to avoid spurious updates due to staggered
        // support. This ignores data for Chrome and Firefox on macOS.
        const mapping = {
          Chrome: {
            Windows: 'chrome',
            Android: 'chrome_android',
          },
          Edge: {
            Windows: 'edge',
          },
          Firefox: {
            Windows: 'firefox',
            Android: 'firefox_android',
          },
          Safari: {
            OSX: 'safari',
            iPhone: 'safari_ios'
          }
        };

        const browser = mapping[browserName] && mapping[browserName][osName];
        if (!browser) {
          return [null, null];
        }

        // Look for a matching MDN/BCD version by removing one version component
        // at a time until there's an exact match. Safari for iOS is special:
        // https://github.com/mdn/browser-compat-data/blob/master/docs/data-guidelines.md#safari-for-ios-versioning
        const mdnReleases = this.mdnBrowsers_[browser].releases;
        const targetVersion = browser === 'safari_ios' ? osVersion : browserVersion;
        const versionParts = targetVersion.split('.');
        while (versionParts.length) {
          const version = versionParts.join('.');
          if (version in mdnReleases) {
            return [browser, version];
          }
          versionParts.pop();
        }

        // No release found.
        return [null, null];
      },
    },
    {
      name: 'fetchJson_',
      code: async function(url) {
        const r = await this.fetch_(url);
        if (!r.ok) {
          throw new Error(`Bad response (${r.status}) for ${url}`);
        }
        return r.json();
      },
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
