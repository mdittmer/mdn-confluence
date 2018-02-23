// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'WebSocketServer',

  requires: [
    'foam.dao.MDAO',
    'foam.dao.WebSocketDAOProvider',
    'org.mozilla.mdn.CachingFirestoreDAO',
    'org.mozilla.mdn.DataEnv',
    'org.mozilla.mdn.DataHashUrlPollingDAO',
    'org.mozilla.mdn.ForkedDAO',
    'org.mozilla.mdn.Issue',
  ],
  imports: [
    'dataEnv',
    'warn',
  ],

  classes: [
    {
      name: 'BoxDAOPair',

      properties: [
        {
          class: 'foam.dao.DAOProperty',
          name: 'dao',
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'box',
        },
      ],
    },
  ],

  properties: [
    {
      // class: 'FObjectProperty',
      // of: 'BoxDAOPair',
      name: 'confluence',
    },
    {
      // class: 'FObjectProperty',
      // of: 'BoxDAOPair',
      name: 'compat',
    },
    {
      // class: 'FObjectProperty',
      // of: 'BoxDAOPair',
      name: 'issues',
    },
  ],

  methods: [
    function start() {
      this.confuence = this.setupPolling_('org.mozilla.mdn.generated.ConfluenceRow',
                                          'confluence');
      this.compat = this.setupPolling_('org.mozilla.mdn.generated.CompatRow',
                                       'compat');
      this.issues = this.setupFirestore_(this.Issue, 'issues', 'issues');
    },
    function setupPolling_(classId, serviceName) {
      const serverDAO = this.DataHashUrlPollingDAO.create({classId});
      const box = this.WebSocketDAOProvider.create({
        serviceName,
        serverDAO,
      }, serverDAO).getServerBox();
      return this.BoxDAOPair.create({dao: serverDAO, box});
    },
    function setupFirestore_(of, serviceName, collectionPath) {
      const serverDAO = this.ForkedDAO.create({
        of,
        serializableDAO: this.CachingFirestoreDAO.create({
          of,
          collectionPath,
        }),
      });
      const box = this.WebSocketDAOProvider.create({
        serviceName,
        serverDAO,
      }, serverDAO).getServerBox();
      return this.BoxDAOPair.create({dao: serverDAO, box});
    },
  ],
});
