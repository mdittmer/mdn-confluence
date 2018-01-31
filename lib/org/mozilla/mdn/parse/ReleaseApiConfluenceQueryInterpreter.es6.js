// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'ReleaseApiConfluenceQueryInterpreter',
  implements: [
    'foam.mlang.Expressions',
    'org.chromium.mlang.GridExpressions',
    'org.mozilla.mdn.mlang.Expressions',
    'org.mozilla.mdn.parse.ConfluenceQueryInterpreter',
  ],
  requires: [
    'org.mozilla.mdn.GridProperty',
    'org.mozilla.mdn.parse.DefaultConfluenceQueryInterpreter',
  ],

  imports: [
    'selectableColumns',
    'selectedColumns',
  ],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        return this.DefaultConfluenceQueryInterpreter.create();
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

      if (key === 'count') {
        return ret(this.interpretCount(value, parser));
      }
      const columns = this.getMatchingColumns(key);
      if (columns.length === 0) return ret(null);
      const boolValue = /^[t1-9]/i.test(value) ? true :
              /^(f.*|0)$/i.test(value) ? false : null;
      if (boolValue === null) return ret(null);

      if (columns.count === 1) {
        return this.EQ(columns[0], boolValue);
      } else {
        let parts = new Array(columns.length);
        for (let i = 0; i < columns.length; i++) {
          parts[i] = this.EQ(columns[i], boolValue);
        }
        return this.AND.apply(this, parts);
      }
    },
    function interpretKeyword(kw, parser) {
      return this.KEYWORD(kw);
    },
    function interpretCount(value, parser) {
      const ret = this.delegate ?
          (v => v === null ?
              this.delegate.interpretKeyValue('count', value, parser) : v) :
          (v => v === null ?
              this.interpretKeyword(`count:${value}`, parser) : v);

      const count = parseInt(value);
      if (Number.isNaN(count)) return ret(null);

      const cols = this.selectedColumns
            .filter(col => this.GridProperty.isInstance(col));
      return this.EQ(this.ARRAY_COUNT(this.SEQ.apply(this, cols),
                                      this.TRUTHY()),
                     count);
    },
    function getMatchingColumns(key) {
      const match = key.match(/^([^0-9]+)([0-9.-]+)?([^0-9]+)?([0-9.-]+)?/i);
      if (match === null) return [];

      const browserName = match[1] && match[1].toLowerCase();
      const browserVersion = match[2] && match[2].toLowerCase();
      const osName = match[3] && match[3].toLowerCase();
      const osVersion = match[4] && match[4].toLowerCase();

      const columns = this.selectableColumns
            .filter(col => this.GridProperty.isInstance(col));

      return columns.filter(
        c => (!browserName ||
              c.release.browserName.toLowerCase().startsWith(browserName)) &&
          (!browserVersion ||
           c.release.browserVersion.toLowerCase().startsWith(browserVersion)) &&
          (!osName ||
           c.release.osName.toLowerCase().startsWith(osName)) &&
          (!osVersion ||
           c.release.osVersion.toLowerCase().startsWith(osVersion)));
    },
  ],
});
