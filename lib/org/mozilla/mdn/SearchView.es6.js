// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'SearchView',
  extends: 'foam.u2.View',

  imports: [
    'localPredicate',
    'queryParserFactory',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: flex;
}

^icon {
  padding: 1rem;
  flex-grow: 0;
  flex-shrink: 0;
}

^ input {
  color: rgb(0, 0, 0);
  font-family: inherit;
  font-size: inherit;
  flex-grow: 1;
  border: none;
  outline: none;
  display: inline-block;
  line-height: 2rem;
  padding: 0.5rem 0;
}
`
    }),
  ],

  properties: [
    {
      name: 'queryParser',
      factory: function() { return this.queryParserFactory(this); },
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: {class: 'foam.u2.tag.Input'},
    },
    {
      name: 'view',
    },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
          .start('label').addClass(this.myClass('icon'))
          .start('i').addClass('material-icons').add('search').end().end()
          .tag(this.viewSpec, {}, this.view$);
      this.view.data$.mapTo(
          this.localPredicate$,
          queryStr => {
            debugger;
            let ret;
            try {
              ret = this.queryParser.parseString(queryStr || '');
            } catch (e) {
              debugger;
            }
            debugger;
            return ret;
          });
    },
  ],
});
