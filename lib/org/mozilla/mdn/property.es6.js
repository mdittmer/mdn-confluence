// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'Property',
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'Function',
      name: 'rawTableCellFormatter',
      value: function(value, obj, axiom) {
        return `<span>${value ? value.label || value.toString() : '&nbsp;'}</span>`;
      },
    },
    {
      class: 'String',
      name: 'gridTemplateColumn',
      value: '1fr',
    },
  ],
});
