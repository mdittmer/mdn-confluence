// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('../boot.es6.js');

(async function() {
  function getPollingDAOWebSocketBox(classId, serviceName) {
    const serverDAO =
          mdn.DataHashUrlPollingDAO.create({classId});
    const box = foam.dao.WebSocketDAOProvider.create({
      serviceName,
      serverDAO,
    }, serverDAO).getServerBox();
    return {dao: serverDAO, box};
  }
  function getModelDAOWebSocketBox(serviceName) {
    const serverDAO = foam.__context__.modelDAO;
    const box = foam.dao.WebSocketDAOProvider.create({
      serviceName,
      serverDAO,
    }, serverDAO).getServerBox();
    return {dao: serverDAO, box};
  }
  // TODO(markdittmer): Need helper function for FirebaseDAO case.

  const confluence = getPollingDAOWebSocketBox(
      'org.mozilla.mdn.generated.ConfluenceRow',
      'confluence');
  const model = getModelDAOWebSocketBox('model');
})().catch(err => {
  console.error('SERVER FAILURE', err);
  debugger;
});
