// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DAOControllerView',
  extends: 'foam.u2.View',
  implements: ['foam.mlang.Expressions'],

  requires: [
    'foam.u2.md.OverlayDropdown',
    'org.mozilla.mdn.ToggleListElementsView',
    'org.mozilla.mdn.SearchView',
  ],
  imports: [
    'data? as importedData',
    'selectable? as importedSelectableColumns',
    'selected? as importedSelectedColumns',
  ],
  exports: [
    'selectable', // For query parser.
    'selected', // For query parser.
    'selected as columns', // For DAO view.
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  min-width: 650px;
  display: grid;
  grid-template-columns: 1fr min-content 0;
  grid-template-rows: min-content 1fr;
}

^DAOView {
  z-index: 1;
  grid-column-end: span 3;
}

^count {
  display: flex;
  justify-content: flex-end;
  grid-column-end: span 3;
  padding: 1rem;
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
      name: 'selectable',
      factory: function() {
        const imported = this.importedSelectableColumns;
        if (Array.isArray(imported) && imported.length > 0 &&
            foam.core.Property.isInstance(imported[0])) {
          return imported;
        }

        const tableColumns = this.of.getAxiomByName('tableColumns');
        if (tableColumns.columns) {
          return tableColumns.columns.map(name => this.of.getAxiomByName(name));
        }

        return this.of.getAxiomsByClass(foam.core.Property)
            .filter(prop => !prop.hidden);
      },
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'selected',
      factory: function() {
        return this.importedSelectedColumns ||
            Array.from(this.selectable);
      },
    },
    {
      name: 'columnSelectionE',
      factory: function() {
        return this.OverlayDropdown.create().add(this.ToggleListElementsView.create({
          selectable: this.selectable,
          selected$: this.selected$,
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
    {
      class: 'Int',
      name: 'count_',
    },
    {
      class: 'Int',
      name: 'total_',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.data$.dot('data').sub(this.onDAOChange);
      this.data$.dot('filteredDAO').sub(this.onFilteredDAOChange);
      this.onDAOChange();
      this.onFilteredDAOChange();
    },
    function initE() {
      let daoView = this.data.FILTERED_DAO.toE(null, this);
      daoView.addClass(this.myClass('DAOView'));
      this.addClass(this.myClass())
          .tag(this.searchSpec, {}, this.searchE$)
          .add(this.columnsButtonE)
          .add(this.columnSelectionE)
          .add(daoView)
          .start('div').addClass(this.myClass('count'))
          .add(this.count_$)
          .entity('nbsp').add('/').entity('nbsp')
          .add(this.total_$);
    },
  ],

  listeners: [
    function onDAOChange() {
      this.data && this.data.data.select(this.COUNT())
          .then(countSink => this.total_ = countSink.value);
    },
    function onFilteredDAOChange() {
      this.data && this.data.filteredDAO.select(this.COUNT())
          .then(countSink => this.count_ = countSink.value);
    },
  ],
});
