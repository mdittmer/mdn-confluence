// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'CompatQueryParser',
  implements: ['foam.mlang.Expressions'],

  requires: [
    'foam.core.Property',
    'foam.core.String',
    'org.mozilla.mdn.parse.DefaultCompatQueryInterpreter',
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      documentation: 'The class of items in the DAO being queried.',
    },
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.parse.CompatQueryInterpreter',
      name: 'interpreter',
      factory: function() {
        return this.DefaultCompatQueryInterpreter.create();
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
                    sym('lor'),
                    sym('keyword')),

          paren: seq1(1, '(', sym('query'), ')'),

          lor: seq(sym('left'), sym('op'), sym('right')),
          left: str(plus(alt(range('a', 'z'), range('A', 'Z'),
                             range('0', '9'), '.', '_'))),
          op: alt('==', '<=', '>=', '<', '>', ':'),
          // op: alt(':', seq('=', optional('=')), seq('<', optional('=')),
          //         seq('>', optional('='))),
          right: str(plus(alt(range('a', 'z'), range('A', 'Z'),
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
        function lor(lor) {
          return this.interpreter.interpretOp(lor[0], lor[1], lor[2], this);
        },
        function keyword(kw) {
          return this.interpreter.interpretKeyword(kw, this);
        },
      ],
    },
  ],
});
