// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'CachingFirestoreDAO',
  package: 'org.mozilla.mdn',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Serializable DAO that encapsulates Firestore + local cache
      strategy.`,

  requires: [
    'com.google.firebase.FirestoreDAO',
    'foam.dao.CachingDAO',
    'foam.dao.MDAO',
  ],

  properties: [
    {
      class: 'String',
      documentation: 'The collection/document path to the Firestore collection',
      name: 'collectionPath',
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.CachingDAO.create({
          src: this.FirestoreDAO.create({
            of: this.of,
            collectionPath: this.collectionPath,
          }),
          cache: this.MDAO.create({of: this.of}),
        });
      },
    },
  ],
});
