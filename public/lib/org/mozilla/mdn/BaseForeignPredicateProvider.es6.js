// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'BaseForeignPredicateProvider',
  extends: 'org.mozilla.mdn.ForeignPredicateProvider',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.sink.Count',
  ],
  exports: ['flowControlId'],

  // TODO(markdittmer): These helped performance when the sink remained
  // client side). Figure out how to use a client-side cache that understands
  // these without forwarding them to a server.
  //
  // classes: [
  //   {
  //     name: 'Count',
  //     extends: 'foam.mlang.sink.Count',

  //     axioms: [
  //       {
  //         class: 'foam.box.Remote',
  //         clientClass: 'foam.dao.ClientSink'
  //       }
  //     ],

  //     imports: ['flowControlId as currentFlowControlId'],

  //     properties: [
  //       {
  //         class: 'Int',
  //         name: 'flowControlId',
  //         required: true,
  //       },
  //     ],

  //     methods: [
  //       function init() {
  //         this.SUPER();
  //         this.validate();
  //       },
  //       function put(_, sub) {
  //         if (sub && this.flowControlId !== this.currentFlowControlId)
  //           sub.detach();
  //         this.SUPER();
  //       },
  //       function remove(_, sub) {
  //         if (sub && this.flowControlId !== this.currentFlowControlId)
  //           sub.detach();
  //         this.SUPER();
  //       },
  //     ],
  //   },
  //   {
  //     name: 'ArraySink',
  //     extends: 'foam.dao.ArraySink',

  //     axioms: [
  //       {
  //         class: 'foam.box.Remote',
  //         clientClass: 'foam.dao.ClientSink'
  //       }
  //     ],

  //     imports: ['flowControlId as currentFlowControlId'],

  //     properties: [
  //       {
  //         class: 'Int',
  //         name: 'flowControlId',
  //         required: true,
  //       },
  //     ],

  //     methods: [
  //       function init() {
  //         this.SUPER();
  //         this.validate();
  //       },
  //       function put(o, sub) {
  //         if (sub && this.flowControlId !== this.currentFlowControlId)
  //           sub.detach();
  //         this.SUPER(o, sub);
  //       },
  //       function remove(o, sub) {
  //         if (sub && this.flowControlId !== this.currentFlowControlId)
  //           sub.detach();
  //         this.SUPER(o, sub);
  //       },
  //     ],
  //   },
  // ],

  properties: [
    {
      class: 'Class',
      name: 'from',
    },
    {
      class: 'Class',
      name: 'to',
    },
    {
      class: 'Int',
      name: 'filterCountThreshold',
      value: 500,
    },
    {
      class: 'Int',
      name: 'flowControlId',
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
              if (this.count_ > this.filterCountThreshold)
                return this.predicate = null;

              return dao.select(this.ArraySink.create({
                flowControlId: this.flowControlId,
              }));
            })).then(this.flowControl(sink => {
              if (!sink) return null;
              while (!sink.array) {
                sink = sink.delegate;
              }
              return this.setPredicateFromArray(sink.array);
            }));
      },
    },
    {
      class: 'Int',
      name: 'count_',
    },
    {
      class: 'Function',
      name: 'setPredicateFromArray',
      value: function(array) {
        return this.predicate = this.IN(this.to.ID, array.map(o => o.id));
      },
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
