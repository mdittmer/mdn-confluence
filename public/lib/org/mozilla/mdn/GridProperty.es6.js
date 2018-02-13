// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require(/path/to/confluence/release);

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'GridProperty',
  extends: 'foam.core.Boolean',

  requires: ['org.chromium.apis.web.Release'],

  axioms: [
    foam.u2.CSS.create({
      code: `
.org-mozilla-mdn-GridProperty {
  display: flex;
  justify-content: center;
  align-items: center;
}

.org-mozilla-mdn-GridProperty.false {
  background-color: #FF8A80;
}

.org-mozilla-mdn-GridProperty.true {
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
        const cls = 'org-mozilla-mdn-GridProperty';
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
