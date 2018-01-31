// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'BrowserInfoProperty',
  extends: 'foam.core.FObjectProperty',
  // TODO(markdittmer): This is a hack to get a .myClass() implementation.
  implements: ['foam.u2.Element'],

  requires: ['org.mozilla.mdn.BrowserInfo'],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: flex;
  justify-content: center;
  align-items: center;
}

^.empty {
  background-color: rgba(0, 0, 0, 0.1);
}

^.true span::after {
  content: '\u2713';
}
`
    }),
  ],

  properties: [
    {
      name: 'of',
      factory: function() { return this.BrowserInfo; },
    },
    {
      name: 'factory',
      // TODO(markdittmer): This bloats the data set. Kept in place for now
      // to avoid forcing compat queries to understand missing data.
      value: function() {
            return this.BrowserInfo.create();
      },
    },
    {
      class: 'String',
      name: 'browserName',
    },
    {
      class: 'String',
      name: 'queryKey',
      expression: function(browserName) {
        return browserName.toLowerCase().replace(/ /g, '_');
      },
    },
    {
      name: 'tableCellFormatter',
      value: function(value, obj, axiom) {
        const cls = axiom.myClass();
        let valueCls = '';
        let strValue = '';
        if (value) {
          if (value.versionAdded === 0) {
            valueCls = 'true';
            value = '&nbsp;';
          } else {
            if (value.versionAdded !== Infinity)
              strValue += value.versionAdded;

            if (value.versionAdded !== Infinity &&
                value.versionRemoved !== Infinity) {
              strValue += '-';
            } else if (value.versionAdded !== Infinity) {
              strValue += '+';
            }

            if (value.versionRemoved !== Infinity)
              strValue += value.versionRemoved;
          }
        } else {
          valueCls= 'empty';
          strValue = '&nbsp;';
        }
        return `<div class="${valueCls ? cls + ' ' + valueCls : cls}"><span>${strValue}</span></div>`;
      },
    },
  ],

  methods: [
    function toString() { return this.name; },
  ],
});
