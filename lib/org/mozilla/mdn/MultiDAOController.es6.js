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
    {
      class: 'Array',
      name: 'localPredicateSubs_',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.data$.sub(this.onDataChange);
      this.foreignPredicateProviders$.sub(this.onDataChange);
      this.onDataChange();
    },
  ],

  listeners: [
    {
      name: 'onDataChange',
      isMerged: true,
      mergeDelay: 10,
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

        // TODO(markdittmer): This doesn't actually need doing if only
        // foreignPredicateProviders changed.
        for (const sub of this.localPredicateSubs_) {
          sub.detach();
        }
        this.localPredicateSubs_ = this.data
            .map(ctrl => ctrl.localPredicate$.sub(this.onLocalPredicateChange));
      },
    },
    {
      name: 'onLocalPredicateChange',
      code: function() {
        for (const fpp of this.data) {
          fpp.predicate = null;
        }
      },
    },
  ],
});
