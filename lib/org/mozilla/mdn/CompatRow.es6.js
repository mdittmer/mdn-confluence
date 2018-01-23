// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require('./BrowserInfo.es6.js');

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatRow',

  requires: ['org.mozilla.mdn.BrowserInfo'],

  properties: [
    {
      class: 'String',
      name: 'id',
      required: true,
    },
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.BrowserInfo',
      name: 'browserInfo',
    },
  ],

  methods: [
    function fromMdnData(data, opt_browserNameMap) {
      const compatMap = data.__compat.support;
      let compatKeys = Object.keys(compatMap);
      if (opt_browserNameMap)
        compatKeys = compatKeys.filter(key => !!opt_browserNameMap[key]);
      let browserInfos = [];
      for (const key of compatKeys) {
        if (!compatMap[key].version_added && !compatMap[key].version_removed)
        continue;
        const browserInfo = this.BrowserInfo.create({
          browserName: opt_browserNameMap ? opt_browserNameMap[key] : key,
          versionAdded: compatMap[key].version_added || '',
          versionRemoved: compatMap[key].version_removed || '',
        });
        browserInfos.push(browserInfo);
      }
      this.browserInfo = browserInfos;
      return this;
    },
  ],
});
