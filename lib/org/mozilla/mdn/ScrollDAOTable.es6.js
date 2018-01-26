// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ScrollDAOTable',
  extends: 'foam.u2.View',

  requires: ['foam.u2.view.ScrollDAOView'],
  imports: [
    'columns? as importedColumns',
  ],
  exports: [
    'columns_ as columns',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: grid;
  grid-template-rows: min-content 1fr;
}

^ col-head {
}

^ col-head {
  overflow: hidden;
  white-space: no-wrap;
  text-overflow: ellipsis;
  padding: 5px;
  border-right: 1px solid #d0d0d0;
}

^ ul.foam-u2-view-ScrollDAOView {
  position: static;
}
`
    }),
  ],

  classes: [
    {
      name: 'RowFormatter',
      implements: ['foam.u2.RowFormatter'],

      imports: ['columns'],

      methods: [
        function format(data, opt_columns) {
          const columns = opt_columns || this.columns;

          // Dummy column takes place in grid for absolutely positioned "Id"
          // column.
          let str = '<span>&nbsp;</span>';
          for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const value = data ? col.f(data) : undefined;
            // if (value === undefined)
            str += col.tableCellFormatter(data ? col.f(data) : undefined, data,
                                          col);
            // const value = data ? col.f(data) : undefined;
            // const contents = value === undefined ? '&nbsp;' : value;
            // if (i === 0) {
            //   str += `<div class="id"><span class="content">${contents}</span></div>`;
            // } else if (value === false) {
            //   str += `<div class="false centered"><span></span></div>`;
            // } else if (value === true) {
            //   str += `<div class="true centered"><span></span></div>`;
            // } else {
            //   str += `<span class="content">${contents}</span>`;
            // }
          }

          return str;
        },
      ],
    },
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'scrollView',
      factory: function() {
        return this.ScrollDAOView.create({
          data$: this.data$,
          rowFormatter: this.RowFormatter.create(),
        });
      },
    },
    {
      class: 'Class',
      name: 'of',
      required: true,
    },
    {
      name: 'columns',
      expression: function(of) {
        const cls = this.of;
        if (!cls) return [];

        const tableColumns = this.importedColumns ||
                cls.getAxiomByName('tableColumns');

        if (tableColumns) return tableColumns.columns;

        return cls.getAxiomsByClass(foam.core.Property)
          .map(foam.core.Property.NAME.f);
      },
    },
    {
      name: 'columns_',
      expression: function(columns, of) {
        const cls = this.of;
        if (!cls) return [];

        return columns.map(function(prop) {
          const col = typeof prop == 'string' ?
                  of.getAxiomByName(prop) :
                  prop;

          if (!col) {
            this.error('Unknown table column: ', prop);
          }

          return col;
        }).filter(function(col) { return !!col; });
      },
    },
  ],

  methods: [
    function initE() {
      this.setNodeName('div').addClass(this.myClass())
        .add(this.slot(function(columns_) {
          let frs = '';
          for (let i = 0; i < columns_.length; i++) {
            frs += '1fr ';
          }
          return this.E('style')
            .add(`
col-heads, ul.foam-u2-view-ScrollDAOView > li {
  padding: 0;
  border-bottom: 1px solid #d0d0d0;
  display: grid;
  grid-template-columns: ${frs};
}
`);
        }))
        .add(this.slot(function(columns_) {
          return this.E('col-heads')
            .forEach(columns_, function(col) {
              this.start('col-head').add(col.label).end();
            });
        }))
        // .add(this.E('div').add('Hello world'))
        .add(this.scrollView)
      ;
    },
  ],
});
