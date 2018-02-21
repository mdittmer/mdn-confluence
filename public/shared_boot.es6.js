// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';


(foam.isServer ? global : window).mdnConfluenceBoot = opt_ctxConfig => {
  function createContext(Parser, Outputter, opt_ctxConfig) {
    // Set up configured box context.
    const boxContext = foam.box.Context.create();
    const baseCtx = boxContext.__subContext__;

    // TODO(markdittmer): Running createSubContext({}) below breaks registry of
    // generated code. This might be a bug in createSubContext().
    const ctx = opt_ctxConfig ? baseCtx.createSubContext(opt_ctxConfig) : baseCtx;

    // Non-strict FON/JSON parsing/outputting.
    //
    // TODO(markdittmer): Non-strict is only needed for channels that transport
    // function such as foam.core.Model definitions, and strict gives better
    // browser performance. Consider having two contexts.
    boxContext.parser = Parser.create({
      creationContext$: boxContext.creationContext$,
    }, ctx);
    boxContext.outputter = Outputter.create(null, ctx)
        .copyFrom(foam.json.Network);

    return ctx;
  }

  const dataCtx = createContext(foam.json.Parser, foam.box.BoxJsonOutputter,
                                  opt_ctxConfig);
  const codeCtx = createContext(foam.json.ModelParser,
                                foam.json.ModelOutputter, opt_ctxConfig);

  // Default ctx is a strict serialization ctx. Expose the permissive code
  // loader ctx and Model DAO (created in code loader ctx) on the default ctx.
  foam.__context__ = dataCtx.createSubContext({
    codeCtx,
    modelDAO: foam.dao.MDAO.create({of: foam.core.Model}, codeCtx),
    dataParser: dataCtx.parser,
    dataOutputter: dataCtx.outputter,
    codeParser: codeCtx.parser,
    codeOutputter: codeCtx.outputter,
  });
};

if (foam.isServer) {
  module.exports = global.mdnConfluenceBoot;
}
