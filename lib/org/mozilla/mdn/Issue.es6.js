// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require('./IssueStatus.es6.js');
// require('./IssueType.es6.js');

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'Issue',

  requires: [
    'org.mozilla.mdn.IssueStatus',
    'org.mozilla.mdn.IssueType',
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      expression: function(type, apiId, description) {
        const typeStr = type.ordinal.toString();
        const apiStr = apiId;
        const descStr = description.replace(/[^a-z0-9]/ig, '_');
        return `${typeStr}:${apiStr}:${descStr}`;
      },
    },
    {
      class: 'String',
      name: 'apiId',
      required: true,
    },
    {
      class: 'Enum',
      of: 'org.mozilla.mdn.IssueType',
      name: 'type',
      required: true,
    },
    {
      class: 'Enum',
      of: 'org.mozilla.mdn.IssueStatus',
      name: 'status',
      factory: function() {
        return this.IssueStatus.OPEN_NEW;
      },
    },
    {
      class: 'String',
      name: 'description',
      required: true,
    },
  ],
});
