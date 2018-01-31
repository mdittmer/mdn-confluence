// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.INTERFACE({
  package: 'org.mozilla.mdn.parse',
  name: 'ConfluenceQueryInterpreter',

  documentation: `A component responsible for interpreting the semantics of
      low-level GridDAO query parts.`,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.parse.ConfluenceQueryInterpreter',
      documentation: 'Support proxying/delegating by default.',
      name: 'delegate',
      value: null,
    },
  ],

  methods: [
    {
      name: 'interpretKeyValue',
      returns: 'foam.mlang.predicate.AbstractPredicate',
      args: [
        {
          typeName: 'String',
          documentation: 'The string key in a "key:value" query fragment.',
          name: 'key',
        },
        {
          typeName: 'String',
          documentation: 'The string value in a "key:value" query fragment.',
          name: 'value',
        },
      ],
    },
    {
      name: 'interpretKeyword',
      returns: 'foam.mlang.predicate.AbstractPredicate',
      args: [
        {
          typeName: 'String',
          documentation: 'The keyword in a keyword query fragment.',
          name: 'kw',
        },
      ],
    },
  ],
});
