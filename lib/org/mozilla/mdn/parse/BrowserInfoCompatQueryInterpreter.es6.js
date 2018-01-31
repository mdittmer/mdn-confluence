// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'BrowserInfoCompatQueryInterpreter',
  implements: [
    'foam.mlang.Expressions',
    'org.chromium.mlang.GridExpressions',
    'org.mozilla.mdn.mlang.Expressions',
    'org.mozilla.mdn.parse.CompatQueryInterpreter',
  ],
  requires: [
    'org.mozilla.mdn.BrowserInfo',
    'org.mozilla.mdn.BrowserInfoProperty',
    'org.mozilla.mdn.parse.DefaultCompatQueryInterpreter',
  ],

  imports: [
    'selectableColumns',
    'selectedColumns',
  ],

  properties: [
    {
      name: 'delegate',
      factory: function() {
        return this.DefaultCompatQueryInterpreter.create();
      },
    },
  ],

  methods: [
    function interpretOp(l, op , r, parser) {
      const ret = this.delegate ?
            (v => v === null ?
             this.delegate.interpretOp(l, op, r, parser) : v) :
            (v => v === null ?
             this.interpretKeyword(`${l}${op}${r}`, parser) : v);

      const floatValue = parseFloat(r);
      if (Number.isNaN(floatValue)) return ret(null);

      const opKey = this.DefaultCompatQueryInterpreter.OPS[op];
      if (!opKey) return ret(null);

      if (!/^[a-z_]+$/i.test(l)) return ret(null);

      const lowerL = l.toLowerCase();
      let browserInfoCols = this.selectableColumns
            .filter(col => this.BrowserInfoProperty.isInstance(col))
            .filter(col => col.queryKey.indexOf(lowerL) === 0);
      if (browserInfoCols.length === 0) return ret(null);
      if (browserInfoCols.length > 1) {
        const exactCol = browserInfoCols
              .filter(col => col.queryKey === lowerL)[0];
        if (exactCol) browserInfoCols = [exactCol];
      }

      if (opKey === 'EQ') {
        return this.AND.apply(
            this,
            // Added before value (or always existed)...
            browserInfoCols.map(browserInfoCol =>
                                this.LTE(
                                    this.DOT(
                                        browserInfoCol,
                                        this.BrowserInfo.VERSION_ADDED),
                                    floatValue))
              // ... AND removed after value (or never removed).
              .concat(browserInfoCols
                      .map(browserInfoCol =>
                           this.GTE(
                               this.DOT(
                                   browserInfoCol,
                                   this.BrowserInfo.VERSION_REMOVED),
                               floatValue))));
      } else if (opKey === 'GT' || opKey === 'GTE') {
        return this.AND.apply(
            this,
            // Removed (on or) after value, AND added any time.
            browserInfoCols.map(browserInfoCol =>
                                this[opKey](
                                    this.DOT(
                                        browserInfoCol,
                                        this.BrowserInfo.VERSION_REMOVED),
                                    floatValue))
              .concat(browserInfoCols.map(browserInfoCol =>
                                          this.LT(
                                              this.DOT(
                                                  browserInfoCol,
                                                  this.BrowserInfo.VERSION_ADDED),
                                              Infinity))));
      } else if (opKey === 'LT' || opKey === 'LTE') {
        return this.AND.apply(
            this,
            browserInfoCols.map(browserInfoCol =>
                                this[opKey](
                                    this.DOT(
                                        browserInfoCol,
                                        this.BrowserInfo.VERSION_ADDED),
                                    floatValue)));
      } else {
        foam.assert(false, `Unexpected query op-key: "${opKey}"`);
        return ret(null);
      }
    },
    function interpretKeyword(kw, parser) {
      return this.KEYWORD(kw);
    },
  ],
});
