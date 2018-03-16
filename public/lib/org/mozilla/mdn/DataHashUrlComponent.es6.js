// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DataHashUrlComponent',

  requires: ['org.mozilla.mdn.HashProvider'],
  imports: ['gcloudProjectId? as importedProjectId'],
  exports: ['gcloudProjectId'],

  properties: [
    {
      class: 'String',
      name: 'gcloudProjectId',
      factory: function() {
        return this.importedProjectId || 'mdn-confluence';
      },
    },
    {
      class: 'String',
      name: 'classId',
      required: true,
    },
    {
      class: 'String',
      name: 'classUrl',
      required: true,
    },
    {
      class: 'String',
      name: 'hashUrl',
      required: true,
    },
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.HashProvider',
      name: 'hashProvider',
      factory: function() {
        return this.HashProvider.create();
      },
    },
    {
      class: 'String',
      name: 'hash_',
    },
    {
      name: 'fs_',
      factory: function() { return require('fs'); },
    },
    {
      name: 'url_',
      factory: function() { return require('url'); },
    },
  ],

  methods: [
    {
      name: 'fetchFromUrl',
      code: function(urlStr) {
        const url = foam.isServer ?
              this.url_.parse(urlStr) :
              new URL(urlStr);
        if (foam.isServer) {
          return this.serverFetch_(url);
        } else {
          return this.httpFetch_(url);
        }
      },
    },
    {
      name: 'serverFetch_',
      code: function(url) {
        if (url.protocol !== 'file:')
          return this.httpFetch_(this.url_.format(url));

        return new Promise((resolve, reject) => {
          this.fs_.readFile(url.pathname, (error, data) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(data.toString());
          });
        });
      },
    },
    {
      name: 'httpFetch_',
      code: (async function(url) {
        const response = await this.HTTPRequest.create({
          url,
          responseType: 'text',
        }).send();
        if (response.status !== 200) throw response;
        return await response.payload;
      }),
    },
  ],
});
