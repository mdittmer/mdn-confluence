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


  axioms: [
    foam.u2.CSS.create({
      code: `
/* TODO(markdittmer): This should come from "^"/"myClass()", but code generation
  with implements: ['foam.u2.Element'] is broken in NodeJS. */
.org-mozilla-mdn-Issue-api-id {
  position: absolute;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  padding: 0 5px;
  z-index: -1;
}
li:hover org-mozilla-mdn-Issue-api-id {
  z-index: initial;
}
`,
    }),
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
      hidden: true,
    },
    {
      class: 'String',
      name: 'apiId',
      label: 'API',
      required: true,
      rawTableCellFormatter: function(value, obj, axiom) {
        const textValue = value === undefined ? '&nbsp;' : value;
        return `
<div class="id">
  ${textValue}
  <span class="overlay">${textValue}</span>
</div>
`;
      },
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
      gridTemplateColumn: '4fr',
    },
  ],
});
