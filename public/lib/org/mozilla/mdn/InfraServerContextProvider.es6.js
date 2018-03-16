// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'InfraServerContextProvider',
  package: 'org.mozilla.mdn',
  extends: 'org.mozilla.mdn.ServerContextProvider',

  axioms: [foam.pattern.Singleton.create()],

  requires: [
    'foam.box.BoxJsonOutputter',
    'foam.json.ModelOutputter',
    'foam.json.ModelParser',
    'foam.json.Parser',
  ],

  classes: [
    {
      name: 'BoxContext',
      extends: 'foam.box.Context',

      properties: [
        {
          name: 'webSocketService',
          value: null,
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
        }, this.dataCtx);
        ctx.parser = this.ModelParser.create({
          creationContext$: ctx.creationContext$,
        }, ctx);
        ctx.outputter = this.ModelOutputter.create(null, ctx)
            .copyFrom(foam.json.Network);
        return ctx;
      },
    },
  ],
});
