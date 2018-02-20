// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

(foam.isServer ? global : window).mdnConfluenceBoot = opt_ctxConfig => {
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
  boxContext.parser = foam.json.Parser.create({
    strict: false,
    creationContext$: boxContext.creationContext$,
  }, ctx);
  boxContext.outputter = foam.box.BoxJsonOutputter
    .create(null, ctx).copyFrom(foam.json.Network).copyFrom({strict: false});

  // Set global-to-FOAM parameters.
  foam.boxContext = boxContext;
  foam.__context__ = ctx;
};

if (foam.isServer) {
  module.exports = global.mdnConfluenceBoot;
}
