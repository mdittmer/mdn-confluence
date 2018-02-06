// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'MultiDAOController',

  exports: [
    'as data',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.DAOController',
      name: 'data',
    },
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.ForeignPredicateProvider',
      name: 'foreignPredicateProviders',
    },
    {
      class: 'Array',
      name: 'daoSubs_',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.data$.sub(this.onChange);
      this.foreignPredicateProviders$.sub(this.onChange);
      this.onChange();
    },
  ],

  listeners: [
    {
      name: 'onChange',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        for (const sub of this.daoSubs_) {
          sub.detach();
        }
        let daoSubs = [];
        for (const ctrl of this.data) {
          const to = ctrl.data.of;
          const foreignPredicateProviders = this.foreignPredicateProviders
                .filter(fpp => fpp.to.id === to.id);
          const foreignPredicateSlots = foreignPredicateProviders
                .map(fpp => fpp.predicate$);
          for (const fpp of foreignPredicateProviders) {
            const fromCtrl = this.data
                  .filter(c => c.data.of.id === fpp.from.id)[0];
            if (!fromCtrl) continue;
            daoSubs.push(fpp.dao$.linkFrom(fromCtrl.filteredDAO$));
          }
          ctrl.foreignPredicateSlots = foreignPredicateSlots;
        }
        this.daoSubs_ = daoSubs;
      },
    },
  ],
});
