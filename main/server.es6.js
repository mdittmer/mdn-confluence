// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('../boot.es6.js');

(async function() {
  function getPollingDAO(classId) {
    return mdn.DataHashUrlPollingDAO.create({
      classId,
    });
  }

  // const confluenceDAO =
  //       getPollingDAO('org.mozilla.mdn.generated.ConfluenceRow');
  const compatDAO = getPollingDAO('org.mozilla.mdn.generated.CompatRow');

  // NEXT TODO: PipeSink is not serializable (refers to a local DAO), but it
  // is blowing up the stack being serialized when pipe() is used below.
  // Also select() should be working, but it seems like PromiseDAOs are not
  // waiting until data are aready. (Could be same root cause: Sink below is
  // not seriailizable either).
  debugger;
  compatDAO.pipe(foam.dao.QuickSink.create({
    putFn: obj => {
      console.log('CompatRow', obj);
      debugger;
    },
  }));
})().catch(err => {
  debugger;
});
