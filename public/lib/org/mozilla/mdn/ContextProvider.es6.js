// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'ContextProvider',
  package: 'org.mozilla.mdn',

  requires: [
    'foam.dao.MDAO',
    'foam.dao.WebSocketDAOProvider',
  ],
  exports: [
    'bcd',
    'codeCtx',
    'codeOutputter',
    'codeParser',
    'creationContext',
    'dataCtx',
    'dataOutputter',
    'dataParser',
    'modelDAOProvider',
  ],

  constants: {
    WEB_SOCKET_DATA_PORT: 4000,
    WEB_SOCKET_MODEL_PORT: 4040,
    MODEL_DAO_SERVICE_NAME: 'models',
  },

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.Context',
      name: 'dataCtx',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Context',
      name: 'codeCtx',
    },
    {
      name: 'dataParser',
      expression: function(dataCtx) {
        return dataCtx.parser;
      },
    },
    {
      name: 'dataOutputter',
      expression: function(dataCtx) {
        return dataCtx.outputter;
      },
    },
    {
      name: 'codeParser',
      expression: function(codeCtx) {
        return codeCtx.parser;
      },
    },
    {
      name: 'codeOutputter',
      expression: function(codeCtx) {
        return codeCtx.outputter;
      },
    },
    {
      name: 'creationContext',
    },
    {
      name: 'dataDAOProvider',
      factory: function() {
        return this.WebSocketDAOProvider.create({
          of: foam.core.Model,
          serviceName: this.MODEL_DAO_SERVICE_NAME,
          port: this.WEB_SOCKET_MODEL_PORT,
          serverDAO: foam.isServer ?
              this.MDAO.create({of: foam.core.Model}, this.codeCtx) : null,
        }, this.codeCtx);
      },
    },
    {
      name: 'modelDAOProvider',
      factory: function() {
        return this.WebSocketDAOProvider.create({
          of: foam.core.Model,
          serviceName: this.MODEL_DAO_SERVICE_NAME,
          port: this.WEB_SOCKET_MODEL_PORT,
          serverDAO: foam.isServer ?
              this.MDAO.create({of: foam.core.Model}, this.codeCtx) : null,
        }, this.codeCtx);
      },
    },
    {
      class: 'String',
      name: 'bcdModuleName',
      value: 'mdn-browser-compat-data',
    },
    {
      name: 'bcd',
      factory: function() {
        // Resolve any relative path.
        return /\.\//.test(this.bcdModuleName) ?
            require(require('path').resolve(this.bcdModuleName)) :
            require(this.bcdModuleName);
      },
    },
  ],

  methods: [
    function install() {
      foam.__context__ = this.creationContext = this.dataCtx.__subContext__;
    },
  ],
});
