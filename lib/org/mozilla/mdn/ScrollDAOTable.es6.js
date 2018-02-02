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
    'columns',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: grid;
  grid-template-rows: min-content 1fr;
}

^ col-heads {
  border-top: 1px solid #d0d0d0;
  overflow-y: scroll;
}

^ col-head {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 8px;
  border-right: 1px solid #d0d0d0;
}

^ span, ^ .id {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

^ .id .overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
}

^ li:hover .id {
  color: transparent;
}

^ li:hover .id .overlay {
  height: 100%;
  color: rgba(0, 0, 0, 0.8);
  background: rgba(255, 255, 255, 0.6);
  display: inline;
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
          // let str = '<span class="grid-placeholder">&nbsp;</span>';
          let str = '';
          for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const value = data ? col.f(data) : undefined;
            str += col.rawTableCellFormatter(data ? col.f(data) : undefined, data,
                                          col);
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
          numRows: 50,
          rowFormatter: this.RowFormatter.create(),
        });
      },
    },
    {
      class: 'Class',
      name: 'of',
      // TODO(markdittmer): This should be an expression, but that's not
      // working.
      factory: function() {
        return this.data.of;
      },
    },
  ],

  methods: [
    function initE() {
      this.setNodeName('div').addClass(this.myClass())
        .add(this.slot(function(columns) {
          let gridTemplateColumns = '';
          for (const column of columns) {
            gridTemplateColumns += `${column.gridTemplateColumn} `;
          }
          return this.E('style')
            .add(`
col-heads, ul.foam-u2-view-ScrollDAOView > li {
  padding: 0;
  border-bottom: 1px solid #d0d0d0;
  display: grid;
  grid-template-columns: ${gridTemplateColumns};
}
`);
        }))
        .add(this.slot(function(columns) {
          return this.E('col-heads')
            .forEach(columns, function(col) {
              this.start('col-head').add(col.label).end();
            });
        }))
        .start('div').style({position: 'relative'}).add(this.scrollView).end();
    },
  ],
});
