// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'DefaultIssueQueryInterpreter',
  implements: [
    'foam.mlang.Expressions',
    'org.mozilla.mdn.parse.IssueQueryInterpreter',
  ],

  requires: ['foam.core.Property'],

  methods: [
    function interpretKeyValue(key, value, parser) {
      const lowerKey = key.toLowerCase();
      const properties = parser.of.getAxiomsByClass(foam.core.Property);
      const matchingProperties = properties
            .filter(prop => prop.name.toLowerCase().indexOf(lowerKey) !== -1);
      if (matchingProperties.length === 0) {
        return this.delegate ?
            this.delegate.interpretKeyValue(key, value, parser) :
            this.interpretKeyword(`${key}:${value}`, parser);
      }
      if (matchingProperties.length > 1) {
        const exactProperty = matchingProperties
              .filter(prop => prop.name.toLowerCase() === lowerKey)[0];
        if (exactProperty) matchingProperties = [exactProperty];
      }
      const property = matchingProperties[0];
      return (foam.core.String.isInstance(property) ? this.CONTAINS_IC :
              this.EQ).call(this, property, value);
    },
    function interpretKeyword(kw, parser) {
      return this.KEYWORD(kw);
    },
  ],
});
