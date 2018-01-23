// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require(/path/to/confluence/release);

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'GridProperty',
  extends: 'foam.core.Boolean',

  requires: ['org.chromium.apis.web.Release'],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.apis.web.Release',
      name: 'release',
    },
  ],
});
