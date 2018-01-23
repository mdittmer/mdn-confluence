// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'BrowserInfo',

  requires: [
    'org.chromium.apis.web.GridRow',
  ],
  imports: [
    // 'releases as importedReleases',
    'info',
    'warn',
  ],

  properties: [
    {
      class: 'String',
      name: 'browserName',
      required: true,
    },
    {
      class: 'String',
      name: 'versionAdded',
    },
    {
      class: 'String',
      name: 'versionRemoved',
    },
    // {
    //   class: 'FObjectArray',
    //   of: 'org.chromium.apis.web.Release',
    //   name: 'releases',
    //   // TODO(markdittmer): This should work as an expression, but isn't.
    //   factory: function() {
    //     const name = this.browserName;
    //     return this.releases.filter(r => r.browserName === name);
    //   },
    // },
  ],

  // methods: [
  //   function getConfluenceAnomalies(row) {
  //     const releaseNum = str => parseInt(str.split('.')[0]);

  //     let added = releaseNum(this.versionAdded);
  //     if (Number.isNaN(added)) added = Infinity;

  //     let removed = releaseNum(this.versionRemoved);
  //     if (Number.isNaN(removed)) removed = Infinity;

  //     for (const release of this.releases) {
  //       const num = releaseNum(release.browserVersion);
  //       if (Number.isNaN(num)) {
  //         this.warn(`VersionInfo.getConfluenceAnomalies:
  //                        Skipping invalid browser version number:
  //                        ${release.browserVersion}`);
  //         continue;
  //       }
  //       const idx = this.gridDAO.colIndexOf(release);
  //       if (num < added && row.data[idx]) {
  //         this.warn(`${row.id} exists in ${release.browserName} ${release.browserVersion} before being added in ${this.browserName} ${this.versionAdded}`);
  //       } else if (num >= added && num < removed && !row.data[idx]) {
  //         this.warn(`${row.id} does not exist in ${release.browserName} ${release.browserVersion} after being added in ${this.browserName} ${this.versionAdded}`);
  //       } else if (num >= removed && row.data[idx]) {
  //         this.warn(`${row.id} exists in ${release.browserName} ${release.browserVersion} after being removed in ${this.browserName} ${this.versionRemoved}`);
  //       }
  //     }

  //     return; // ...
  //   },
  // ],
});
