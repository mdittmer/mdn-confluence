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
    'org.mozilla.mdn.EditColumnsView',
    'org.mozilla.mdn.SearchView',
  ],
  imports: [
    'data? as importedData',
  ],
  exports: [
    'selectableColumns', // For query parser.
    'selectedColumns', // For query parser.
    'selectedColumns as columns', // For DAO view.
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: grid;
  grid-template-columns: 1fr min-content 0;
  grid-template-rows: min-content 1fr;
}

^DAOView {
  z-index: 1;
  grid-column-end: span 3;
}

^icon {
  z-index: 2;
  display: inline-block;
  padding: 1rem;
}

^button {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

^button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

^ .foam-u2-md-OverlayDropdown {
  width: 300px;
}

/* TODO(markdittmer): Should probably add a different CSS class to searchE for
   this. */
^ .org-mozilla-mdn-SearchView {
  z-index: 3;
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
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'selectableColumns',
      factory: function() {
        return this.of.tableColumns ||
            this.of.getAxiomsByClass(foam.core.Property)
            .filter(prop => !prop.hidden);
      },
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'selectedColumns',
      factory: function() {
        return Array.from(this.selectableColumns);
      },
    },
    {
      name: 'columnSelectionE',
      factory: function() {
        return this.OverlayDropdown.create().add(this.EditColumnsView.create({
          selectableColumns: this.selectableColumns,
          selectedColumns$: this.selectedColumns$,
          table: this.of,
        }));
      },
    },
    {
      name: 'columnsButtonE',
      factory: function() {
        return this.E('i').addClass('material-icons').add('more_vert')
          .addClass(this.myClass('icon')).addClass(this.myClass('button'))
          .on('click', () => {
            this.columnSelectionE.open();
          });
      },
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchSpec',
      value: {class: 'org.mozilla.mdn.SearchView'},
    },
    {
      name: 'searchE',
    },
  ],

  methods: [
    function initE() {
      let daoView = this.data.FILTERED_DAO.toE(null, this);
      daoView.addClass(this.myClass('DAOView'));
      this.addClass(this.myClass())
          .tag(this.searchSpec, {}, this.searchE$)
          .add(this.columnsButtonE)
          .add(this.columnSelectionE)
          .add(daoView);
    },
  ],
});
