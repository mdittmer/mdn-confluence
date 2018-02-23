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
    {
      name: 'url_',
      factory: function() { return require('url'); },
    },
  ],

  methods: [
    function start() {
      this.confuence = this.setupPolling_('org.mozilla.mdn.generated.ConfluenceRow',
                                          'confluence');
      this.compat = this.setupPolling_('org.mozilla.mdn.generated.CompatRow',
                                       'compat');

      if (this.dataEnv.backendIsRemote) {
        this.issues = this.setupFirestore_(this.Issue, 'issues', 'issues');
      } else {
        this.issues = this.setupPolling_('org.mozilla.mdn.Issue',
                                         'issues');
      }
    },
    function setupPolling_(classId, serviceName) {
      const serverDAO = this.DataHashUrlPollingDAO.create({classId});
      return this.getBoxDAOPair_(serviceName, serverDAO);
    },
    function setupFirestore_(of, serviceName, collectionPath) {
      const serverDAO = this.ForkedDAO.create({
        of,
        serializableDAO: this.CachingFirestoreDAO.create({
          of,
          collectionPath,
        }),
      });
      return this.getBoxDAOPair_(serviceName, serverDAO);
    },
    function getBoxDAOPair_(serviceName, serverDAO) {
      const box = this.WebSocketDAOProvider.create({
        serviceName,
        serverDAO,
      }, serverDAO).getServerBox();
      return this.BoxDAOPair.create({dao: serverDAO, box});
    },
  ],
});
