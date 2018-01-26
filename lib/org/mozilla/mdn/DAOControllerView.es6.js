// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DAOControllerView',
  extends: 'foam.u2.View',

  imports: [
    'data? as importedData',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: grid;
}
`
    }),
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.DAOController',
      name: 'data',
      expression: function(importedData) { return importedData; },
      required: true,
    },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).add(this.data.FILTERED_DAO);
    },
  ],
});
