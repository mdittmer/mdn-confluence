// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require(/path/to/confluence/release);

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'GridProperty',
  extends: 'foam.core.Boolean',
  // TODO(markdittmer): This is a hack to get a .myClass() implementation.
  implements: ['foam.u2.Element'],

  requires: ['org.chromium.apis.web.Release'],

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  display: flex;
  justify-content: center;
  align-items: center;
}

^.false {
  background-color: #FF8A80;
}

^.true {
  background-color: #B9F6CA;
}
`
    }),
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.chromium.apis.web.Release',
      name: 'release',
    },
    {
      name: 'rawTableCellFormatter',
      value: function(value, obj, axiom) {
        const cls = axiom.myClass();
        const valueCls = value === true ? 'true' : value === false ?
                'false' : '';
        const iconValue = value === true ? 'check' : value === false ?
                'clear' : 'hourglass_empty';
        return `
<div class="${cls} ${valueCls}">
  <span class="material-icons">${iconValue}</span>
</div>
`;
      },
    },
  ],

  methods: [
    function toString() { return this.name; },
  ],
});
