// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'WebClientContextProvider',
  package: 'org.mozilla.mdn',
  extends: 'org.mozilla.mdn.ContextProvider',

  axioms: [foam.pattern.Singleton.create()],

  requires: [
    'foam.box.BoxJsonOutputter',
    'foam.box.Context',
    'foam.dao.WebSocketDAOProvider',
    'foam.json.ModelOutputter',
    'foam.json.ModelParser',
    'foam.json.Parser',
  ],
  exports: ['modelDAO'],

  properties: [
    {
      name: 'dataCtx',
      factory: function() {
        const ctx = this.Context.create({
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
        const ctx = this.Context.create({
          creationContext$: this.creationContext$,
          webSocketPort: 4040,
        });
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
        return this.modelDAOProvider.createClientDAO(this.codeCtx);
      },
    },
  ],
});
