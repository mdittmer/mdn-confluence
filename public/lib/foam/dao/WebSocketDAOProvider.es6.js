// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'foam.dao',
  name: 'WebSocketDAOProvider',

  documentation: `Provider for client/server DAO pairs.`,

  requires: [
    'foam.box.SkeletonBox',
    'foam.box.SubBox',
    'foam.dao.EasyDAO',
  ],
  imports: [
    'registry?',
    'webSocketService',
    'window?',
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true,
    },
    {
      class: 'String',
      name: 'serviceName',
      required: true,
    },
    {
      class: 'String',
      name: 'hostname',
      factory: function() {
        return this.window ? this.window.location.hostname : 'localhost';
      },
    },
    {
      class: 'Int',
      name: 'port',
      factory: function() {
        return this.webSocketService.port || 4000;
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'serverDAO',
    },
    {
      name: 'serverBox_',
      factory: function() {
        // Ensure that webSocketSevice is started.
        this.webSocketService;

        return this.registry.register(
            this.serviceName, null, this.SkeletonBox.create({
              data: this.serverDAO,
            }));
      },
    },
  ],

  methods: [
    function getServerBox() {
      return this.serverBox_;
    },
    function createClientDAO(opt_ctx) {
      const ctx = opt_ctx || this;
      let dao = this.EasyDAO.create({
        of: this.of,
        daoType: 'CLIENT',
        remoteListenerSupport: true,
        serviceName: `ws://${this.hostname}:${this.port}/${this.serviceName}`,
      }, ctx);

      // TODO(markdittmer): Additional SubBox needed to get server box
      // management to work correctly. This is a workaround for the TODO at
      // https://github.com/foam-framework/foam2/blob/933635e22f89ba37dbc36ef8928253a5cd91bf4e/src/foam/dao/EasyDAO.js#L291
      dao.delegate.delegate = this.SubBox.create({
        name: this.serviceName,
        delegate: dao.delegate.delegate,
      }, ctx);

      return dao;
    },
  ],
});
