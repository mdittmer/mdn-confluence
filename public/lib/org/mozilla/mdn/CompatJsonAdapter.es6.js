// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatJsonAdapter',

  axioms: [foam.pattern.Singleton.create()],

  requires: ['org.mozilla.mdn.GridProperty'],

  properties: [
    {
      class: 'Function',
      name: 'defaultArrayMatcher',
      value: function(array) {
        for (let i = 0; i < array.length; i++) {
          if (!array[i].notes) return i;
        }
        return -1;
      },
    },
  ],

  methods: [
    function confluenceRowToCompatJsonFragment(row, opts) {
      const props = row.cls_.getAxiomsByClass(this.GridProperty)
            .sort((p1, p2) => foam.util.compare(
                p1.release.releaseDate,
                p2.release.releaseDate));

      const support = {};

      // Scan through the row once, interleaving which browser is being updated.
      // This is equivalent to processing each browser in turn because the state
      // for each browser is contained in |support[browser]|.
      for (const prop of props) {
        const [browser, version] = this.getMdnBrowserRelease(prop.release, opts.mdnBrowsers);
        if (!browser || !version) {
          continue;
        }
        if (opts && opts.browsers && opts.browsers.length &&
            !opts.browsers.includes(browser)) {
          continue;
        }

        const value = prop.f(row);

        if (!support[browser]) {
          // This is the first release in Confluence.
          support[browser] = {};
          if (value) {
            // Use ≤ except for Edge 12 which is the first release.
            // (This could be generalized by consulting |opts.mdnBrowsers|.)
            if (browser === 'edge' && version === '12') {
              support[browser].version_added = version;
            } else {
              support[browser].version_added = '≤' + version;
            }
          } else {
            support[browser].version_added = false;
          }
          continue;
        }

        if (value && !support[browser].version_added) {
          if (!support[browser].version_removed) {
            support[browser].version_added = version;
          }
        } else if (support[browser].version_added && !value) {
          if (!support[browser].version_removed) {
            support[browser].version_removed = version;
          }
        } else if (value && support[browser].version_removed) {
          // This is the case of an API being added, removed, and then added
          // again. Put the information in `maintainer_notes` for now.
          if (!support[browser].maintainer_notes) {
            support[browser].maintainer_notes = [];
          }
          support[browser].maintainer_notes.push(`Removed in ${support[browser].version_removed}`);
          support[browser].maintainer_notes.push(`Added in ${version}`);
          delete support[browser].version_removed;
        }
      }

      return support;
    },
    function patch(base, patch, opts) {
      if (opts && opts.patchPredicate && !opts.patchPredicate(base, patch)) {
        return;
      }

      for (const key of Object.keys(patch)) {
        const value = patch[key];

        if (Array.isArray(base[key])) {
          this.patchOntoArray(base[key], value, opts);
        } else if (Array.isArray(value)) {
          this.patchArrayOnto(base, value, key, opts);
        } else if (this.isObject_(value)) {
          if (!this.hap_(base, key)) base[key] = {};
          this.patch(base[key], value, opts);
        } else {
          base[key] = value;
        }
      }
    },
    function patchOntoArray(base, patch, opts) {
      if (Array.isArray(patch)) {
        for (let i = 0; i < patch.length; i++) {
          if (foam.Undefined.isInstance(patch[i])) continue;
          if (this.isObject_(base[i]) && this.isObject_(patch[i])) {
            this.patch(base[i], patch[i], opts);
          } else {
            base[i] = patch[i];
          }
        }
      } else {
        const idx = ((opts && opts.arrayMatcher) ||
                     this.defaultArrayMatcher)(base);
        if (idx === -1) base.unshift(patch);
        else this.patch(base[idx], patch, opts);
      }
    },
    function patchArrayOnto(base, patch, key, opts) {
      if (foam.Undefined.isInstance(base[key])) {
        base[key] = [];
        this.patchOntoArray(base[key], patch);
        return;
      }

      const idx = ((opts && opts.arrayMatcher) ||
                   this.defaultArrayMatcher)(patch);
      if (idx === -1) {
        patch.unshift(base[key]);
      } else {
        this.patch(base[key], patch[idx], opts);
      }
      base[key] = [];
      this.patchOntoArray(base[key], patch);
    },
    function getMdnBrowserRelease(release, mdnBrowsers) {
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
      const mdnReleases = mdnBrowsers[browser].releases;
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
    function isObject_(value) {
      return value !== null && foam.Object.isInstance(value);
    },
    function hap_(obj, propName) {
      return Object.prototype.hasOwnProperty.call(obj, propName);
    },
  ],
});
