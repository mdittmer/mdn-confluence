// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ConfluenceCompatPredicateProvider',
  extends: 'org.mozilla.mdn.ForeignPredicateProvider',

  requires: [
    'org.mozilla.mdn.generated.ConfluenceRow',
    'org.mozilla.mdn.generated.CompatRow',
  ],
  exports: ['flowControlId'],

  classes: [
    {
      name: 'Count',
      extends: 'foam.mlang.sink.Count',

      imports: ['flowControlId as currentFlowControlId'],

      properties: [
        {
          class: 'Int',
          name: 'flowControlId',
          required: true,
        },
      ],

      methods: [
        function init() {
          this.SUPER();
          this.validate();
        },
        function put(_, sub) {
          if (sub && this.flowControlId !== this.currentFlowControlId)
            sub.detach();
          this.SUPER();
        },
        function remove(_, sub) {
          if (sub && this.flowControlId !== this.currentFlowControlId)
            sub.detach();
          this.SUPER();
        },
      ],
    },
    {
      name: 'ArraySink',
      extends: 'foam.dao.ArraySink',

      imports: ['flowControlId as currentFlowControlId'],

      properties: [
        {
          class: 'Int',
          name: 'flowControlId',
          required: true,
        },
      ],

      methods: [
        function init() {
          this.SUPER();
          this.validate();
        },
        function put(o, sub) {
          if (sub && this.flowControlId !== this.currentFlowControlId)
            sub.detach();
          this.SUPER(o, sub);
        },
        function remove(o, sub) {
          if (sub && this.flowControlId !== this.currentFlowControlId)
            sub.detach();
          this.SUPER(o, sub);
        },
      ],
    },
  ],

  properties: [
    {
      class: 'Class',
      name: 'from',
      final: true,
      factory: function() { return this.ConfluenceRow; },
    },
    {
      class: 'Class',
      name: 'to',
      final: true,
      factory: function() { return this.CompatRow; },
    },
    {
      class: 'Function',
      name: 'onDAOChange',
      value: function() {
        if (!this.dao) return;

        this.flowControlId++;

        const dao = this.dao;
        dao.select(this.Count.create({flowControlId: this.flowControlId}))
            .then(this.flowControl(countSink => {
              if (!countSink || countSink.value === this.count_) return null;
              this.count_ = countSink.value;
              if (this.count_ > 500) return this.predicate = null;
              return dao.select(this.ArraySink.create({
                flowControlId: this.flowControlId,
              }));
            })).then(this.flowControl(arraySink => {
              if (!arraySink) return null;
              return this.predicate = this.IN(
                  this.CompatRow.ID,
                  arraySink.array
                    .map(confluenceRow => confluenceRow.id));
            }));
      },
    },
    {
      class: 'Int',
      name: 'count_',
    },
    {
      class: 'Int',
      name: 'flowControlId',
    },
  ],

  methods: [
    function flowControl(f) {
      return this.withFlowControl.bind(this, this.flowControlId, f);
    },
    function withFlowControl(flowControlId, f) {
      if (this.flowControlId !== flowControlId) return null;
      const args = Array.from(arguments).slice(2);
      return f.apply(this, args);
    },
  ],
});
