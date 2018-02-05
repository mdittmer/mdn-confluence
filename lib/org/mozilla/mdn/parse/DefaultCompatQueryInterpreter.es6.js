// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'DefaultCompatQueryInterpreter',
  implements: [
    'foam.mlang.Expressions',
    'org.mozilla.mdn.parse.CompatQueryInterpreter',
  ],

  requires: ['foam.core.Property'],

  constants: {
    OPS: {
      ':': 'EQ',
      '=': 'EQ',
      '==': 'EQ',
      '<': 'LT',
      '>': 'GT',
      '<=': 'LTE',
      '>=': 'GTE',
    },
  },

  methods: [
    function interpretOp(l, op, r, parser) {
      const property = parser.of.getAxiomByName(l);
      if (!property || !this.Property.isInstance(property) ||
          !this.OPS[op]) {
        return this.delegate ?
            this.delegate.interPretOp(l, op, r, parser) :
            this.interpretKeyword(`${l}${op}${r}`, parser);
      }
      return this[this.OPS[op]](property, r);
    },
    function interpretKeyword(kw, parser) {
      return this.KEYWORD(kw);
    },
  ],
});
