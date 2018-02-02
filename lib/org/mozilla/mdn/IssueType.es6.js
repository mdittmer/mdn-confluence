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
      label: 'Unspecified',
    },
    {
      name: 'VERSION_BEFORE_ADDED',
      label: 'In Confluence before MDN added',
    },
    {
      name: 'VERSION_WITHIN_RANGE',
      label: 'Missing from Confluence within MDN range',
    },
    {
      name: 'VERSION_AFTER_REMOVED',
      label: 'In Confluence after MDN removed',
    },
  ],
});
