// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'WebServerContextProvider',
  package: 'org.mozilla.mdn',
  extends: 'org.mozilla.mdn.ServerContextProvider',

  axioms: [foam.pattern.Singleton.create()],

  requires: [
    'foam.box.BoxJsonOutputter',
    'foam.json.ModelOutputter',
    'foam.json.ModelParser',
    'foam.json.Parser',
    'org.mozilla.mdn.ContextProvider',
  ],
  exports: ['modelDAO'],

  classes: [
    {
      name: 'BoxContext',
      extends: 'foam.box.Context',

      requires: [
        'foam.net.node.WebSocketService',
        'org.mozilla.mdn.ContextProvider',
      ],

      properties: [
        {
          class: 'Int',
          name: 'webSocketPort',
          factory: function() {
            return this.ContextProvider.WEB_SOCKET_DATA_PORT;
          },
        },
        {
          name: 'webSocketService',
          factory: function() {
            return this.WebSocketService.create({
              port: this.webSocketPort,
              delegate: this.registry,
            });
          },
        },
      ],
    },
  ],

  properties: [
    {
      name: 'dataCtx',
      factory: function() {
        const ctx = this.BoxContext.create({
          creationContext$: this.creationContext$,
        });
        ctx.parser = this.Parser.create({
          creationContext$: ctx.creationContext$,
        }, ctx);
        ctx.outputter = this.BoxJsonOutputter.create(null, ctx)
            .copyFrom(foam.json.Network);
        return ctx;
      },
    },
    {
      name: 'codeCtx',
      factory: function() {
        const ctx = this.BoxContext.create({
          creationContext$: this.creationContext$,
          webSocketPort: this.ContextProvider.WEB_SOCKET_MODEL_PORT,
        }, this.dataCtx);
        ctx.parser = this.ModelParser.create({
          creationContext$: ctx.creationContext$,
        }, ctx);
        ctx.outputter = this.ModelOutputter.create(null, ctx)
            .copyFrom(foam.json.Network);
        return ctx;
      },
    },
    {
      name: 'modelDAO',
      factory: function() {
        this.modelDAOProvider.getServerBox();
        return this.modelDAOProvider.serverDAO;
      },
    },
  ],
});
