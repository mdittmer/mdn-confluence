// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';


(foam.isServer ? global : window).mdnConfluenceBoot = opt_ctxConfig => {
  // TODO(markdittmer): Running createSubContext({}) below breaks registry of
  // generated code. This might be a bug in createSubContext().
  const baseCtx = opt_ctxConfig ?
          foam.__context__.createSubContext(opt_ctxConfig) : foam.__context__;
  const dataBoxContext = foam.box.Context.create(null, baseCtx);
  const dataCtx = dataBoxContext.__subContext__;

  dataBoxContext.parser = foam.json.Parser.create({
    creationContext$: dataBoxContext.creationContext$,
  }, dataCtx);
  dataBoxContext.outputter = foam.box.BoxJsonOutputter.create(null, dataCtx)
    .copyFrom(foam.json.Network);

  // Create derived context with model parser/outputters for handling code.
  // Bind in the same creation context so that setting new creationContext
  // propagates to data context as well.
  const codeCtx = dataCtx.createSubContext({
    parser: foam.json.ModelParser.create({
      // Share creation context across data and code.
      creationContext$: dataBoxContext.creationContext$,
    }, dataCtx),
    outputter: foam.json.ModelOutputter.create(null, dataCtx)
      .copyFrom(foam.json.Network),
  });
  const codeBoxContext = foam.box.Context.create({
    // TODO(markdittmer): Provider for this?
    webSocketService: foam.isServer ?
        foam.net.node.WebSocketService.create({port: 4040}, codeCtx) :
        foam.net.web.WebSocketService.create(null, codeCtx),
    parser: codeCtx.parser,
    outputter: codeCtx.outputter,
  }, codeCtx);

  // Default ctx is a strict serialization ctx. Expose the permissive code
  // loader ctx and Model DAO (created in code loader ctx) on the default ctx.
  foam.__context__ = dataCtx.createSubContext({
    dataCtx,
    codeCtx,
    // TODO(markdittmer): Provider for this?
    modelDAO: foam.isServer ?
        foam.dao.MDAO.create({of: foam.core.Model}, codeCtx) :
        foam.dao.WebSocketDAOProvider.create({
          of: foam.core.Model,
          serviceName: 'models',
        }, codeCtx).createClientDAO(),
    dataParser: dataCtx.parser,
    dataOutputter: dataCtx.outputter,
    codeParser: codeCtx.parser,
    codeOutputter: codeCtx.outputter,
  });
  foam.boxContext = dataBoxContext;
};

if (foam.isServer) {
  module.exports = global.mdnConfluenceBoot;
}
