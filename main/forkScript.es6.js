// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('../boot.es6.js');

(async function() {
  // TODO(markdittmer): This could suffer from a race condition wrt parent
  // process's view of code. Really, these models should be delivered from the
  // parent.
  let nextCtx = foam.__context__;
  nextCtx = await mdn.DataHashUrlCodeLoader.create({
    classId: 'org.mozilla.mdn.generated.ConfluenceRow',
  }).maybeLoad();
  nextCtx = await mdn.DataHashUrlCodeLoader.create({
    classId: 'org.mozilla.mdn.generated.CompatRow',
  }).maybeLoad();

  // const boxContext = foam.box.Context.create(null, nextCtx);
  // const ctx = boxContext.__subContext__;
  // foam.boxContext = boxContext;
  // foam.__context__ = ctx;

  // const logger = foam.log.ConsoleLogger.create();
  foam.box.node.ForkBox.CONNECT_TO_PARENT(foam.boxContext);
})();
