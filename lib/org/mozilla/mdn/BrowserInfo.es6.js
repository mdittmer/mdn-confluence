// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'BrowserInfo',

  constants: {
    VERSION_NEVER: -1,
    VERSION_ALWAYS: 0,
  },

  properties: [
    {
      class: 'Int',
      name: 'versionAdded',
      value: -1,
    },
    {
      class: 'Int',
      name: 'versionRemoved',
      value: -1,
    },
  ],
});
