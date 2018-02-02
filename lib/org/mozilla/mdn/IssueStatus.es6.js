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
      label: 'Unspecified',
    },
    {
      name: 'OPEN_NEW',
      label: 'New',
    },
    {
      name: 'OPEN_ACTIVE',
      label: 'Active',
    },
    {
      name: 'CLOSED_FIXED',
      label: 'Fixed',
    },
    {
      name: 'CLOSED_DUPLICATE',
      label: 'Duplicate',
    },
    {
      name: 'CLOSED_INVALID',
      label: 'Invalid',
    },
    {
      name: 'CLOSED_WONT_FIX',
      label: "Won't Fix",
    },
  ],
});
