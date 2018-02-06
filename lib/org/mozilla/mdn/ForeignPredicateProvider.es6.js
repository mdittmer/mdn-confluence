// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ForeignPredicateProvider',
  implements: ['foam.mlang.Expressions'],

  properties: [
    {
      class: 'Class',
      name: 'from',
      required: true,
    },
    {
      class: 'Class',
      name: 'to',
      required: true,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      factory: function() {
        return this.TRUE;
      },
    },
    {
      class: 'Function',
      name: 'onDAOChange',
      value: function() {},
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.dao$.sub(this.onDAOChange_);
      this.onDAOChange_();
    },
  ],

  listeners: [
    {
      name: 'onDAOChange_',
      isFramed: true,
      code: function() {
        this.onDAOChange();
      },
    },
  ],
});
