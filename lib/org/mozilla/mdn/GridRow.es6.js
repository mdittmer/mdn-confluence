// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require('./VersionInfo.es6.js');

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'GridRow',
  extends: 'org.chromium.apis.web.GridRow',

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.VersionInfo',
      name: 'compatVersionInfo',
    },
  ],
});
