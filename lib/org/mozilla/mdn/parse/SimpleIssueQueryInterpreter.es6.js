// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'SimpleIssueQueryInterpreter',
  implements: [
    'foam.mlang.Expressions',
    'org.chromium.mlang.GridExpressions',
    'org.mozilla.mdn.mlang.Expressions',
    'org.mozilla.mdn.parse.IssueQueryInterpreter',
  ],
  requires: [
    'org.mozilla.mdn.GridProperty',
    'org.mozilla.mdn.parse.DefaultIssueQueryInterpreter',
  ],

  imports: [
    'selectableColumns',
    'selectedColumns',
  ],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        return this.DefaultIssueQueryInterpreter.create();
      },
    },
  ],

  methods: [
    function interpretKeyValue(key, value, parser) {
      const ret = this.delegate ?
          (v => v === null ?
              this.delegate.interpretKeyValue(key, value, parser) : v) :
          (v => v === null ?
              this.interpretKeyword(`${key}:${value}`, parser) : v);

      const column = this.selectableColumns.filter(col => col.name === key)[0];
      if (!column || !foam.core.Enum.isInstance(column)) return ret(null);

      const enumValues = column.of.VALUES;
      const upperValue = value.toUpperCase();
      const matchingValues = enumValues
            .filter(enumValue => enumValue.name.indexOf(upperValue) !== -1);
      if (matchingValues.length === 0) return ret(null);

      return this.IN(column, matchingValues);
    },
    function interpretKeyword(kw, parser) {
      return this.KEYWORD(kw);
    },
  ],
});
