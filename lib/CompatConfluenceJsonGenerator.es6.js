// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('https');
const path = require('path');

const compareVersions = require('compare-versions');

const {CompatJson} = require('./CompatJson.es6.js');
const {CompatJsonAdapter} = require('./CompatJsonAdapter.es6.js');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (!(res.statusCode >= 200 && res.statusCode <= 299)) {
        reject(new Error(`Bad response ${res.statusCode} ${res.statusMessage} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks)));
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reject);
    });
  });
}

function ensureDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => (err ? reject(err) : resolve()));
  });
}

class CompatConfluenceJsonGenerator {
  constructor(args) {
    this.confluenceReleaseUrl = args.confluenceReleaseUrl;
    this.confluenceDataUrl = args.confluenceDataUrl;
    this.fillOnly = args.fillOnly;
    this.remove = args.remove;
    this.outputDir = args.outputDir;
    this.interfaces = args.interfaces;
    this.browsers = args.browsers;

    // Load BCD module. Resolve any relative path.
    this.bcd_ = /\.\//.test(args.bcdModule) ?
      require(path.resolve(args.bcdModule)) :
      require(args.bcdModule);

    this.mdnApis_ = this.bcd_.api;
    this.mdnBrowsers_ = this.bcd_.browsers;
    this.mdnBuiltins_ = this.bcd_.javascript.builtins;
  }

  async generateJson() {
    // Load and preprocess the Confluence data. The rows have a list of
    // booleans in the same order as the releases.
    const confluenceReleases = await fetchJson(this.confluenceReleaseUrl);
    const confluenceData = await fetchJson(this.confluenceDataUrl);
    // This will be the list of releases in BCD we have data for and that we
    // should try to update, taking the --browsers arg into account.
    const releases = [];
    confluenceReleases.forEach((confluenceRelease, columnIndex) => {
      if (this.shouldIgnoreRelease_(confluenceRelease)) {
        return;
      }
      const [browser, version] = this.getMdnBrowserRelease_(confluenceRelease);
      if (!browser || !version) {
        return;
      }
      if (this.browsers &&
          this.browsers.length &&
          !this.browsers.includes(browser)) {
        return;
      }
      // Add or update an entry in |releases|. One entry can end up with
      // multiple Confluence releases attached to it.
      let release = releases.find((r) => {
        return r.browser === browser && r.version === version;
      });
      if (!release) {
        release = {browser, version, confluence: []};
        releases.push(release);
      }
      release.confluence.push(Object.assign({columnIndex}, confluenceRelease));
    });
    // Sort by version. It doesn't matter if browsers are interleaved.
    releases.sort((a, b) => compareVersions(a.version, b.version));

    this.ensureDirs_();

    const patchOpts = {
      // Called to determine if the patch should be applied, potentially
      // with modifications.
      patchFilter: (base, patch) => {
        function isString(value) {
          return typeof value === 'string';
        }
        function isRange(value) {
          return typeof value === 'string' && value.startsWith('≤');
        }
        assert(!isRange(patch.version_removed),
            'Removed version as range not supported');

        // Don't add a range if it doesn't contradict the base data.
        if (isString(base.version_added) &&
            isRange(patch.version_added) &&
            compareVersions.compare(
                base.version_added.replace('≤', ''),
                patch.version_added.replace('≤', ''), '<=')) {
          if (Object.keys(patch).length === 1) {
            return null;
          } else {
            // Still process the rest of the patch.
            patch = Object.assign({}, patch);
            delete patch.version_added;
          }
        }

        if (!this.remove) {
          // When not asked to trust removals...
          if ('version_removed' in patch) {
            // don't add `version_removed`,
            return null;
          }

          if ('version_added' in patch) {
            if (base.version_added && !patch.version_added) {
              // don't change `version_added` from true/string to false/null,
              return null;
            }
            if (isString(base.version_added) &&
                isString(patch.version_added) &&
                compareVersions.compare(
                    base.version_added.replace('≤', ''),
                    patch.version_added.replace('≤', ''), '<')) {
              // and don't increase `version_added`.
              return null;
            }
          }
        }

        if (this.fillOnly) {
          // Only update `version_added` from falsy to truthy.
          if (base.version_added || !patch.version_added) {
            return null;
          }
        }

        return patch;
      },
    };

    const jsons = {};
    const ifaces = Object.assign({}, this.mdnApis_, this.mdnBuiltins_);
    const ifaceKeys =
      this.interfaces.length > 0 ?
        this.interfaces.filter((str) => !!ifaces[str]) :
        Object.keys(ifaces);
    for (const iface of ifaceKeys) {
      if (iface.indexOf('__') !== -1) {
        continue;
      }

      const json = this.getJson_(iface, jsons).fromNpmModule(this.bcd_);
      const interfacesJson = json.getInterfacesJson();

      // Get list of legitimate APIs. If none, continue.
      const apiKeys = Object.keys(ifaces[iface])
          .filter((api) => !(/[^a-z]/i.test(api) ||
                             !(ifaces[iface][api].__compat &&
                               ifaces[iface][api].__compat.support)));
      if (apiKeys.length === 0) {
        continue;
      }

      for (const api of apiKeys) {
        const confluenceRow = confluenceData.find((r) => {
          return r.id === `${iface}#${api}`;
        });
        if (!confluenceRow) {
          continue;
        }
        const adapter = new CompatJsonAdapter();
        const compatSupport = ifaces[iface][api].__compat.support;
        const confluenceSupport = adapter.confluenceRowToCompatJsonFragment(
            confluenceRow,
            releases,
        );
        for (const key in compatSupport) {
          if (confluenceSupport[key]) {
            const baseSupport = interfacesJson[iface][api].__compat.support;
            assert(baseSupport[key],
                `Missing base ${key} support for ${iface}#${api}`);
            adapter.patch(baseSupport[key], confluenceSupport[key], patchOpts);
          }
        }
      }

      jsons[json.id] = json;
    }

    const promises = [];
    for (const id of Object.keys(jsons)) {
      const json = jsons[id];
      promises.push(
          writeFile(`${this.outputDir}/${json.compatDir}/${json.interfaceName}.json`,
              JSON.stringify(json.json, null, 2) + '\n'),
      );
    }

    return Promise.all(promises);
  }

  shouldIgnoreRelease_(release) {
    const {browserName, browserVersion} = release;

    // Chrome 43 changed bindings to move attributes from instances to
    // prototypes. This has a very large impact on what APIs Confluence
    // discovers and where they are reported, so ignore earlier version.
    if (browserName === 'Chrome' &&
        compareVersions.compare(browserVersion, '43', '<')) {
      return true;
    }

    // Safari 5 and 6 data in Confluence is very broken:
    // https://github.com/GoogleChromeLabs/confluence/issues/121
    if (browserName === 'Safari' &&
        compareVersions.compare(browserVersion, '7', '<')) {
      return true;
    }

    return false;
  }

  getMdnBrowserRelease_(release) {
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
        iPhone: 'safari_ios',
      },
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
  }

  getJson_(interfaceName, jsons) {
    let json;
    if (this.mdnBuiltins_[interfaceName]) {
      json = new CompatJson('javascript/builtins', interfaceName);
    } else {
      json = new CompatJson('api', interfaceName);
    }

    if (jsons[json.id]) {
      return jsons[json.id];
    }
    return json;
  }

  ensureDirs_() {
    ensureDir(`${this.outputDir}/api`);
    ensureDir(`${this.outputDir}/javascript`);
    ensureDir(`${this.outputDir}/javascript/builtins`);
  }
}

module.exports = {CompatConfluenceJsonGenerator};
