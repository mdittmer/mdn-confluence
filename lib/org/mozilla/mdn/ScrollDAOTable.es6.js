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
}

^ col-head {
  overflow: hidden;
  white-space: no-wrap;
  text-overflow: ellipsis;
  padding: 8px;
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
            str += col.tableCellFormatter(data ? col.f(data) : undefined, data,
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
          let frs = '';
          for (let i = 0; i < columns.length; i++) {
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
        .add(this.slot(function(columns) {
          return this.E('col-heads')
            .forEach(columns, function(col) {
              this.start('col-head').add(col.label).end();
            });
        }))
        .add(this.scrollView)
      ;
    },
  ],
});
