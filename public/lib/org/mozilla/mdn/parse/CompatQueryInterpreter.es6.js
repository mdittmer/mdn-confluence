// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.INTERFACE({
  package: 'org.mozilla.mdn.parse',
  name: 'CompatQueryInterpreter',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.parse.CompatQueryInterpreter',
      documentation: 'Support proxying/delegating by default.',
      name: 'delegate',
      value: null,
    },
  ],

  methods: [
    {
      name: 'interpretOp',
      returns: 'foam.mlang.predicate.AbstractPredicate',
      args: [
        {
          typeName: 'String',
          documentation: `The string <left> in a "<left><op><right>" query
              fragment.`,
          name: 'l',
        },
        {
          typeName: 'String',
          documentation: `The string <op> in a "<left><op><right>" query
              fragment.`,
          name: 'op',
        },
        {
          typeName: 'String',
          documentation: `The string <right> in a "<left><op><right>" query
              fragment.`,
          name: 'r',
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
