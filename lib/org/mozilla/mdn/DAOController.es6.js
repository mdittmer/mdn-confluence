// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DAOController',
  implements: ['foam.mlang.Expressions'],

  imports: ['daos? as selectedDAOs'],
  exports: [
    'as data',
    'localPredicate',
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
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.ForeignDAOController',
      name: 'foreignDAOControllers',
    },
    {
      name: 'localPredicate',
    },
    {
      name: 'predicate',
      hidden: true,
      expression: function(localPredicate) {
        // TODO(markdittmer): How should this interact with foreignDAOControllers?
        return localPredicate;
      },
    },
    {
      name: 'filteredDAO',
      view: {class: 'org.mozilla.mdn.ScrollDAOTable'},
      expression: function(data, predicate) {
        return predicate ? data.where(predicate) : data;
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      if (!this.selectedDAOs$) return;

      this.selectedDAOs$.sub(this.onMultiDAOs);
      this.onMultiDAOs();
    },
  ],

  listeners: [
    function onMultiDAOs() {
      const daos = this.selectedDAOs;
      for (const dao of daos) {
        for (const ctrl of this.foreignDAOControllers) {
          if (ctrl.handle(dao)) break;
        }
      }
    },
  ],
});
