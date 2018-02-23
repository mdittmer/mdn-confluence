// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ServerContextProvider',
  extends: 'org.mozilla.mdn.ContextProvider',

  requires: [
    'foam.box.LoggedLookupContext',
    'org.mozilla.mdn.DataEnv',
  ],
  exports: [
    'dataEnv',
    'gcloudProjectId',
    'gcloudCredentialsPath',
  ],

  properties: [
    {
      class: 'Enum',
      of: 'org.mozilla.mdn.DataEnv',
      name: 'dataEnv',
      factory: function() {
        const dataEnvStr = this.process_.env.DATA_ENV || 'UNDEFINED';
        return this.DataEnv[dataEnvStr] || this.DataEnv.DEV;
      },
    },
    {
      class: 'String',
      name: 'gcloudProjectId',
      factory: function() {
        return this.process_.env.GCLOUD_PROJECT || 'mdn-confluence';
      },
    },
    {
      class: 'String',
      name: 'gcloudCredentialsPath',
      factory: function() {
        const credentialsPath = `${__dirname}/../../../../../.local/credentials.json`;
        return this.fs_.existsSync(credentialsPath) ? credentialsPath : '';
      },
    },
    {
      name: 'fs_',
      factory: function() { return require('fs'); },
    },
    {
      name: 'process_',
      factory: function() { return require('process'); },
    },
  ],
});
