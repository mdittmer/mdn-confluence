// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DAOController',
  implements: ['foam.mlang.Expressions'],

  imports: ['stack? as importedStack'],
  exports: [
    'as data',
    'localPredicate',
    'selection',
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      hidden: true,
    },
    {
      class: 'String',
      name: 'name',
      factory: function() {
        return this.data && this.data && this.data.of && this.data.of.name ||
            this.cls_.name;
      },
    },
    {
      class: 'String',
      name: 'label',
      factory: function() {
        return this.name;
      },
    },
    {
      class: 'Array',
      name: 'selection',
      adapt: function(_, nu) {
        if (foam.Null.isInstance(nu) || foam.Undefined.isInstance(nu))
          return [];

        return foam.Array.isInstance(nu) ? nu : [nu];
      },
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Slot',
      name: 'foreignPredicateSlots',
      hidden: true,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'localPredicate',
      hidden: true,
      value: null,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      hidden: true,
      value: null,
    },
    {
      name: 'filteredDAO',
      view: {class: 'org.mozilla.mdn.ScrollDAOTable'},
      expression: function(data, predicate) {
        return predicate ? data.where(predicate) : data;
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.stack.Stack',
      name: 'stack',
      expression: function(importedStack) { return this.importedStack; },
    },
    {
      class: 'Array',
      name: 'foreignPredicateSubs_',
      hidden: true,
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.foreignPredicateSlots$.sub(this.onPredicateArrayChange);
      this.localPredicate$.sub(this.onPredicateChange);
      this.onPredicateArrayChange();
      this.onPredicateChange();
    },
    function detachSubs_(subs) {
      for (const sub of subs) {
        sub.detach();
      }
    },
  ],

  actions: [
    {
      name: 'edit',
      icon: 'edit',
      isAvailable: function(stack) {
        return !!stack;
      },
      isEnabled: function(selection) {
        return selection.length === 1;
      },
      code: function(ctx, ctrl) {
        this.stack.push(this.selection[0], this);
      },
    }
  ],

  listeners: [
    {
      name: 'onPredicateArrayChange',
      isMerged: true,
      mergeDelay: 10,
      code: function() {
        for (const sub of this.foreignPredicateSubs_) {
          sub.detach();
        }
        this.foreignPredicateSubs_ = this.foreignPredicateSlots
            .map(slot => slot.sub(this.onPredicateChange));
      },
    },
    {
      name: 'onPredicateChange',
      isMerged: true,
      mergeDelay: 10,
      code: function() {
        let predicates = this.localPredicate &&
            this.localPredicate !== this.TRUE ? [this.localPredicate] : [];
        for (const slot of this.foreignPredicateSlots) {
          const predicate = slot.get();
          if (!predicate || predicate === this.TRUE) continue;
          predicates.push(predicate);
        }
        return this.predicate = predicates.length === 0 ? null :
            predicates.length === 1 ? predicates[0] :
            this.AND.apply(this, predicates);
      },
    },
  ],
});
