// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.mozilla.mdn',
  name: 'IssueType',

  values: [
    {
      name: 'TYPE_UNSPECIFIED',
    },
    {
      name: 'VERSION_BEFORE_ADDED',
    },
    {
      name: 'VERSION_WITHIN_RANGE',
    },
    {
      name: 'VERSION_AFTER_REMOVED',
    },
  ],
});
