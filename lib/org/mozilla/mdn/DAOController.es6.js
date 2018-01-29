// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DAOController',
  implements: ['foam.mlang.Expressions'],

  imports: ['foreignPredicates?'],
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
      name: 'localPredicate',
    },
    {
      name: 'predicate',
      hidden: true,
      expression: function(foreignPredicates, localPredicate) {
        if (!foreignPredicates) {
          return localPredicate;
        }

        return this.AND.apply(this, [localPredicate].concat(foreignPredicates));
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
});
