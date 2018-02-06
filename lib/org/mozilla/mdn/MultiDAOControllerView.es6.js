// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'MultiDAOControllerView',
  extends: 'foam.u2.View',

  requires: [
    'org.mozilla.mdn.ToggleListElementsView',
    'org.mozilla.mdn.DAOControllerView'
  ],
  imports: [
    'data? as importedData',
  ],
  exports: [
    'selectable as selectableDaoControllers',
    'selected as selectedDAOControllers',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: flex;
  flex-direction: column;
}
^select-collections {
  flex-grow: 0;
  display: flex;
}

^select-collections > * {
  margin-left: 16px;
}

^collections {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
}

^collections > * {
  flex-grow: 1;
  flex-shrink: 1;
}
`,
    }),
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.MultiDAOController',
      name: 'data',
      expression: function(importedData) { return importedData; },
      required: true,
    },
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.DAOController',
      name: 'selectable',
      factory: function() {
        return Array.from(this.data.data);
      },
    },
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.DAOController',
      name: 'selected',
      factory: function() {
        return Array.from(this.selectable);
      },
    },
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.ForeignPredicateProvider',
      name: 'foreignPredicateProviders',
    },
    {
      name: 'selectionE',
      factory: function() {
        return this.ToggleListElementsView.create({
          selectable: this.selectable,
          selected$: this.selected$,
          table: this.of,
        }).addClass(this.myClass('select-collections'));
      },
    },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
          .add(this.selectionE)
          .add(this.slot((data, foreignPredicateProviders) => {
            const parent = this.E('div').addClass(this.myClass('collections'));
            for (const ctrl of data) {
              parent.add(this.DAOControllerView.create(null, ctrl));
            }
            return parent;
          }, this.selected$, this.foreignPredicateProviders$));
    },
  ],
});
