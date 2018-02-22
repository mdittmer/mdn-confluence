// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'foam.dao',
  name: 'ReadWriteSplitDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `A DAO that sends read and write operations to different
      delegates.`,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'reader',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'writer',
    },
    {
      name: 'delegate',
      expression: function(reader) {
        if (!reader) return null;
        return this.ReadOnlyDAO.create({delegate: reader});
      },
    },
    {
      name: 'writer_',
      expression: function(writer) {
        if (!writer) return null;
        return this.WriteOnlyDAO.create({delegate: writer});
      },
    },
  ],

  methods: [
    function put_(ctx, obj) {
      return this.writer_.put_(ctx, obj);
    },
    function remove_(ctx, obj) {
      return this.writer_.remove_(ctx, obj);
    },
    function removeAll_(ctx, skip, limit, order, predicate) {
      return this.writer_.removeAll_(ctx, skip, limit, order, predicate);
    },
  ],
});
