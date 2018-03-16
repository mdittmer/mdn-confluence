// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('../boot.es6.js');
mdn.InfraServerContextProvider.create().install();

(async function() {
  // TODO(markdittmer): This could suffer from a race condition wrt parent
  // process's view of code. Really, these models should be delivered from the
  // parent.
  const codeCtx = foam.__context__.codeCtx;
  await mdn.DataHashUrlCodeLoader.create({
    classId: 'org.mozilla.mdn.generated.ConfluenceRow',
  }, codeCtx).maybeLoad();
  await mdn.DataHashUrlCodeLoader.create({
    classId: 'org.mozilla.mdn.generated.CompatRow',
  }, codeCtx).maybeLoad();

  foam.box.node.ForkBox.CONNECT_TO_PARENT(foam.__context__.dataCtx);
})();
