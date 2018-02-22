// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ModelDAOMonitor',

  documentation: `Monitor a `,

  requires: ['foam.dao.QuickSink'],
  imports: [
    'creationContext',
    'modelDAO? as importedModelDAO',
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'modelDAO',
      factory: function() { return this.importedModelDAO; },
    },
    {
      class: 'String',
      name: 'classId',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
    },
    {
      class: 'Function',
      returns: 'foam.dao.DAO',
      name: 'daoFactory',
      required: true,
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.modelDAO$proxy.listen(this.QuickSink.create({
        putFn: this.onModelPut,
      }));
    },
  ],

  listeners: [
    function onModelPut(model) {
      if (model.id !== this.classId) return;

      model.validate();
      const cls = model.buildClass();
      cls.validate();
      const ctx = this.creationContext.createSubContext({});
      ctx.register(cls);
      foam.package.registerClass(cls);
      this.dao = this.daoFactory({of: cls}, ctx);
    },
  ],
});
