// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatJsonAdapter',

  axioms: [foam.pattern.Singleton.create()],

  requires: ['org.mozilla.mdn.GridProperty'],

  methods: [
    function confluenceRowToCompatJsonFragment(row) {
      const props = row.cls_.getAxiomsByClass(this.GridProperty)
            .sort((p1, p2) => foam.util.compare(
                p1.release.releaseDate,
                p2.release.releaseDate));
      const browserNames = new Set(
          props.map(p => p.release.browserName));

      let support = {};

      for (const browserName of browserNames) {
        var browserData = props
            .filter(p => p.release.browserName === browserName)
            .map(prop => { return {prop, value: prop.f(row)}; });
        if (browserData.filter(d => !!d.value).length === 0) continue;

        let versionAdded = null;
        let versionRemoved = null;
        for (const {prop, value} of browserData) {
          if (value && !versionAdded) {
            const version = prop.release.browserVersion;
            const lastDotIdx = version.lastIndexOf('.');
            versionAdded = lastDotIdx === -1 ? version :
                version.substr(0, lastDotIdx);
          }
          if (versionAdded && !value) {
            const version = prop.release.browserVersion;
            const lastDotIdx = version.lastIndexOf('.');
            versionRemoved = lastDotIdx === -1 ? version :
                version.substr(0, lastDotIdx);
          }
        }

        foam.assert(versionAdded, `Expected to find ${browserName} version`);

        const mdnBrowserName = browserName.toLowerCase();
        support[mdnBrowserName] = {};
        if (versionAdded) support[mdnBrowserName].version_added = versionAdded;
        if (versionRemoved)
          support[mdnBrowserName].version_added = versionRemoved;
      }

      return support;
    },
    function patchCompatJsonFileFromConfluenceRow(json, row) {
      const patch = this.confluenceRowToCompatJsonFragment(row);
      let data = json;
      // while (Object.keys(data).length === 1) {
      //   for (const key of Object.keys(data)) {
      //     data = data[key];
      //     break;
      //   }
      // }

      data = data[row.interfaceName] || (data[row.interfaceName] = {});
      data = data[row.apiName] || (data[row.apiName] = {});
      data = data.__compat || (data.__compat = {});
      data = data.support || (data.support = {});

      this.patch(data, patch);

      return json;
    },
    function patch(base, patch) {
      for (const key of Object.keys(patch)) {
        var value = patch[key];
        if (this.isObject_(value)) {
          if (!base[key]) base[key] = {};
          this.patch(base[key], patch[key]);
        } else {
          base[key] = patch[key];
        }
      }
    },
    function isObject_(value) {
      return value !== null && foam.Object.isInstance(value);
    },
  ],
});
