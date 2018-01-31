// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'DefaultConfluenceQueryInterpreter',
  implements: [
    'foam.mlang.Expressions',
    'org.mozilla.mdn.parse.ConfluenceQueryInterpreter',
  ],

  requires: ['foam.core.Property'],

  methods: [
    function interpretKeyValue(key, value, parser) {
      const property = parser.of.getAxiomByName(key);
      if (!property || !this.Property.isInstance(property)) {
        return this.delegate ?
            this.delegate.interpretKeyValue(key, value, parser) :
            this.interpretKeyword(`${key}:${value}`, parser);
      }
      return this.EQ(property, value);
    },
    function interpretKeyword(kw, parser) {
      return this.KEYWORD(kw);
    },
  ],
});
