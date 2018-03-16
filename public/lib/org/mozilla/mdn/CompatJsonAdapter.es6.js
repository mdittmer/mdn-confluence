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
      const browserNames = new Set(
          props.map(p => p.release.browserName));

      let support = {};

      for (const browserName of browserNames) {
        if (opts && opts.browsers &&
            !opts.browsers.includes(browserName.toLowerCase())) {
          continue;
        }

        const browserProps = props
            .filter(p => p.release.browserName === browserName);
        if (browserProps.filter(p => !!p.f(row)).length === 0) continue;

        let versionAdded = null;
        let versionRemoved = null;
        for (let i = 0; i < browserProps.length; i++) {
          const browserProp = browserProps[i];
          const value = browserProp.f(row);
          if (value && !versionAdded) {
            if (i === 0) {
              versionAdded = true;
            } else {
              versionAdded = this.getVersionString(
                  row, browserProp, browserProps);
            }
          }
          if (versionAdded && !value) {
            versionRemoved = this.getVersionString(
                row, browserProp, browserProps);
            break;
          }
        }

        foam.assert(versionAdded, `Expected to find ${browserName} version`);

        const mdnBrowserName = browserName.toLowerCase();
        support[mdnBrowserName] = {};

        // Only add version_added if:
        // (1) Missing=>added transition observed (i.e., versionAdded !== true),
        // or
        // (2) Existing data claims there is no version_added.
        if (versionAdded !== true ||
            (opts && opts.existing &&
             !(opts.existing[mdnBrowserName] &&
               opts.existing[mdnBrowserName].version_added))) {
          support[mdnBrowserName].version_added = versionAdded;
        }

        if (versionRemoved)
          support[mdnBrowserName].version_removed = versionRemoved;
      }

      return support;
    },
    function patchCompatJsonFileFromConfluenceRow(json, row, opts) {
      const patch = this.confluenceRowToCompatJsonFragment(row);
      let data = json;

      data = data[row.interfaceName] || (data[row.interfaceName] = {});
      data = data[row.apiName] || (data[row.apiName] = {});
      data = data.__compat || (data.__compat = {});
      data = data.support || (data.support = {});

      this.patch(data, patch, opts);

      return json;
    },
    function patch(base, patch, opts) {
      for (const key of Object.keys(patch)) {
        const value = patch[key];
        if (Array.isArray(base[key])) {
          this.patchOntoArray(base[key], value, opts);
        } else if (Array.isArray(value)) {
          this.patchArrayOnto(base, value, key, opts);
        } else if (this.isObject_(value)) {
          if (!base.hasOwnProperty(key)) base[key] = {};
          this.patch(base[key], value);
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
            this.patch(base[i], patch[i]);
          } else {
            base[i] = patch[i];
          }
        }
      } else {
        const idx = ((opts && opts.arrayMatcher) ||
                     this.defaultArrayMatcher)(base);
        if (idx === -1) base.unshift(patch);
        else this.patch(base[idx], patch);
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
        this.patch(base[key], patch[idx]);
      }
      base[key] = [];
      this.patchOntoArray(base[key], patch);
    },
    function getVersionString(row, browserProp, browserProps) {
      let version = browserProp.release.browserVersion;
      const versionParts = version.split('.');

      // Attempt to shrink version string to be as short as possible.
      while (versionParts.length > 1) {
        // Get all browsers with matching version prefix.
        browserProps = browserProps
            .filter(p => p.release.browserVersion.indexOf(version) !== -1);

        // If fewer than 2 browser have this prefix, then shrink version number
        // and continue.
        if (browserProps.length < 2) {
          versionParts.pop();
          version = versionParts.join('.');
          continue;
        }

        // Check whether all browsers with prefix have same value.
        let value = browserProps[0].f(row);
        let i;
        for (i = 1; i < browserProps.length; i++) {
          if (browserProps[i].f(row) !== value) break;
        }
        // If exited loop early, then not all browser with prefix have same
        // value. Stop shrinking version number immediately.
        if (i < browserProps.length) break;

        // Shrink version number.
        versionParts.pop();
        version = versionParts.join('.');
      }

      return version;
    },
    function isObject_(value) {
      return value !== null && foam.Object.isInstance(value);
    },
  ],
});
