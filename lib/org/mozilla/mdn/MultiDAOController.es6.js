// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'MultiDAOController',

  exports: [
    'as data',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'org.mozilla.mdn.DAOController',
      name: 'data',
    },
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.DAOController',
      name: 'selectedDAOControllers',
      factory: function() {
        return Array.from(this.daoControllers || []);
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      name: 'daos',
    },
  ],
});
