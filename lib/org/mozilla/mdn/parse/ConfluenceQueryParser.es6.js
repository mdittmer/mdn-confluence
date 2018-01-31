// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'ConfluenceQueryParser',
  implements: ['foam.mlang.Expressions'],

  requires: [
    'foam.core.Property',
    'foam.core.String',
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      documentation: 'The class of items in the DAO being queried.',
    },
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.parse.ConfluenceQueryInterpreter',
      name: 'interpreter',
      factory: function() {
        return this.DefaultConfluenceQueryInterpreter.create();
      },
    },
  ],

  methods: [
    function parseString(str, opt_name) {
      return this.queryGrammar.parseString(str, opt_name);
    },
  ],

  grammars: [
    {
      name: 'queryGrammar',
      language: 'foam.parse.Parsers',
      symbols: function() {
        return {
          START: sym('query'),
          query: seq1(1, sym('ws'), sym('or'), sym('ws')),

          or: plus(sym('and'), sym('orDelim')),
          orDelim: alt(seq(sym('ws'), literalIC('OR'), sym('ws')),
                       seq(sym('ws'), '|', sym('ws'))),

          and: plus(sym('expr'), sym('andDelim')),
          andDelim: alt(seq(sym('ws'), literalIC('AND'), sym('ws')),
                        not(sym('orDelim'), sym('wsRequired'))),

          expr: alt(sym('paren'),
                    sym('keyValue'),
                    sym('keyword')),

          paren: seq1(1, '(', sym('query'), ')'),

          keyValue: seq(sym('key'), ':', sym('value')),
          key: str(plus(alt(range('a', 'z'), range('A', 'Z'),
                            range('0', '9'), '.', '_'))),
          value: str(plus(alt(range('a', 'z'), range('A', 'Z'),
                              range('0', '9'), '.', '_', '#', ','))),

          keyword: str(plus(alt(range('a', 'z'), range('A', 'Z'),
                                range('0', '9'), '.', '_', '#'))),

          ws: repeat0(chars(' \t\r\n')),
          wsRequired: plus(chars(' \t\r\n')),
        };
      },
      actions: [
        function or(exprs) {
          if (exprs.length === 0) return this.TRUE;
          if (exprs.length === 1) return exprs[0];
          return this.OR.apply(this, exprs);
        },
        function and(exprs) {
          if (exprs.length === 0) return this.TRUE;
          if (exprs.length === 1) return exprs[0];
          return this.AND.apply(this, exprs);
        },
        function keyValue(keyColonValue) {
          const key = keyColonValue[0];
          const value = keyColonValue[2];

          return this.interpreter.interpretKeyValue(key, value, this);
        },
        function keyword(kw) {
          return this.interpreter.interpretKeyword(kw, this);
        },
      ],
    },
  ],
});
