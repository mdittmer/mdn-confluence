// Copyright 2018 The Chromium Authors. All rights reserved.
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

  tableColumns: ['apiId', 'type', 'status', 'description'],

  properties: [
    {
      name: 'id',
      expression: function(apiId, type) {
        return `${apiId}%${type}`;
      },
      hidden: true,
    },
    {
      class: 'String',
      name: 'apiId',
      label: 'API',
      required: true,
      visibility: 'RO',
      rawTableCellFormatter: function(value, obj, axiom) {
        const textValue = value === undefined ? '&nbsp;' : value;
        return `
<div class="id">
  ${textValue}
  <div class="overlay"><span>${textValue}</span></div>
</div>
`;
      },
    },
    {
      class: 'Enum',
      of: 'org.mozilla.mdn.IssueType',
      name: 'type',
      required: true,
      visibility: 'RO',
    },
    {
      class: 'FObjectArray',
      of: 'org.chromium.apis.web.Release',
      name: 'releases',
      visibility: 'RO',
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
      gridTemplateColumn: '3fr',
      view: 'foam.u2.tag.TextArea',
    },
    {
      class: 'String',
      name: 'notes',
      view: 'foam.u2.tag.TextArea',
    },
  ],
});
