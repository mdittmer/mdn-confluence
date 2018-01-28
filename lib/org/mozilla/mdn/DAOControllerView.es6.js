// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DAOControllerView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.md.OverlayDropdown',
    'foam.u2.view.EditColumnsView',
  ],
  imports: [
    'columns',
    'columns_',
    'data? as importedData',
  ],
  exports: [
    'columns_ as columns',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: grid;
  grid-template-columns: 1fr min-content 0;
  grid-template-rows: min-content 1fr;
}

^-DAOView {
  grid-column-end: span 3;
}

^-icon {
  padding: 1rem;
}

^-button {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

^-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  cursor: pointer;
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
    {
      class: 'Class',
      name: 'of',
      // TODO(markdittmer): This should work as an expression, but doesn't.
      factory: function() { return this.data.data.of; },
    },
    {
      name: 'columnSelectionE',
      factory: function() {
        debugger;
        return this.OverlayDropdown.create().add(this.EditColumnsView.create({
          columns: this.columns,
          columns_$: this.columns_$,
          table: this.of,
        }));
      },
    },
    {
      name: 'columnsButtonE',
      factory: function() {
        return this.E('i').addClass('material-icons').add('more_vert')
          .addClass(this.myClass('-icon')).addClass(this.myClass('-button'))
          .on('click', () => {
            this.columnSelectionE.open();
          });
      },
    },
  ],

  methods: [
    function initE() {
      let daoView = this.data.FILTERED_DAO.toE(null, this);
      daoView.addClass(this.myClass('-DAOView'));
      this.addClass(this.myClass())
        .start('div').add('search').end()
        .add(this.columnsButtonE)
        .add(this.columnSelectionE)
        .add(daoView);
    },
  ],
});
