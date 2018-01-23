// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.mozilla.mdn',
  name: 'IssueStatus',

  values: [
    {
      name: 'STATUS_UNSPECIFIED',
    },
    {
      name: 'OPEN_NEW',
    },
    {
      name: 'OPEN_ACTIVE',
    },
    {
      name: 'CLOSED_FIXED',
    },
    {
      name: 'CLOSED_DUPLICATE',
    },
    {
      name: 'CLOSED_INVALID',
    },
    {
      name: 'CLOSED_WONT_FIX',
    },
  ],
});
