// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'BaseImporter',

  requires: [
    'foam.json.ModelOutputter',
    'foam.json.Outputter',
    'org.chromium.apis.web.Release',
    'org.chromium.apis.web.SerializableHttpJsonDAO',
    'org.chromium.apis.web.SerializableLocalJsonDAO',
    'org.mozilla.mdn.HashProvider',
  ],
  imports: [
    'codeCtx?',
    'codeOutputter? as importedCodeOutputter',
    'dataCtx?',
    'dataEnv',
    'dataOutputter? as importedDataOutputter',
    'gcloudCredentialsPath',
    'gcloudProjectId',
  ],

  properties: [
    {
      name: 'releaseJsonUrl',
      factory: function() {
        return this.url_.parse(
            this.dataEnv.getConfluenceReleaseUrl(this.gcloudProjectId));
      },
      adapt: function(_, nu) {
        if ( foam.String.isInstance(nu) ) return this.url_.parse(nu);
        return nu;
      },
    },
    {
      name: 'codeOutputter',
      factory: function() {
        return this.importedCodeOutputter ||
            this.ModelOutputter.create(null, this.codeCtx || this);
      },
    },
    {
      name: 'dataOutputter',
      factory: function() {
        return this.importedDataOutputter || this.Outputter.create({
          pretty: false,
          formatDatesAsNumbers: true,
          outputDefaultValues: false,
          useShortNames: false,
          strict: true,
        }, this.dataCtx || this);
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'releaseDAO',
      factory: function() {
        return this.releaseJsonUrl.protocol === 'file:' ?
            this.SerializableLocalJsonDAO.create({
              of: this.Release,
              path: this.releaseJsonUrl.pathname,
            }) : this.SerializableHttpJsonDAO.create({
              of: this.Release,
              url: this.url_.format(this.releaseJsonUrl),
            });
      },
    },
    {
      class: 'String',
      name: 'gcloudStorageBucketName',
      factory: function() { return `${this.gcloudProjectId}.appspot.com`; },
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
      class: 'FObjectArray',
      of: 'org.chromium.apis.web.Release',
      name: 'releases_',
    },
    {
      name: 'dataClassSpec_',
      value: null,
    },
    {
      class: 'Class',
      name: 'dataClass_',
      value: null,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      value: null,
    },
    {
      name: 'fs_',
      factory: function() { return require('fs'); },
    },
    {
      name: 'url_',
      factory: function() { return require('url'); },
    },
    {
      name: 'storage_',
      factory: function() {
        let config = {projectId: this.gcloudProjectId};
        if (this.gcloudCredentialsPath)
          config.keyFilename = this.gcloudCredentialsPath;
        return require('@google-cloud/storage')(config);
      },
    },
    {
      name: 'storageBucketPromise_',
      factory: function() {
        const bucket = this.storage_.bucket(this.gcloudStorageBucketName);
        return this.storage_.bucket(this.gcloudStorageBucketName).exists()
            .then(doesExistArray => doesExistArray[0] ? bucket :
                  bucket.create())
            .then(b => b);
      },
    },
  ],

  methods: [
    //
    // Interface methods:
    //
    {
      name: 'generateDataClass',
      code: (async function() {}),
    },
    {
      name: 'getDAO',
      code: (async function() {}),
    },
    {
      name: 'importClassAndData',
      code: (async function() {}),
    },

    //
    // Shared helper functions.
    //
    {
      name: 'getReleases_',
      code: (async function() {
        if (this.releases_.length > 0) return this.releases_;
        const arraySink = await this.releaseDAO
              .orderBy(this.Release.RELEASE_DATE).select();
        return this.releases_ = arraySink.array;
      }),
    },
    {
      name: 'importClass_',
      code: function(cls) {
        const modelStr = this.codeOutputter.stringify(cls.model_);
        const hashStr = this.getHash_(modelStr);
        const modelUrl = this.dataEnv.getModelUrl(cls.id, this.gcloudProjectId);
        const modelHashUrl = this.dataEnv.getModelHashUrl(
            cls.id, this.gcloudProjectId);
        return this.writeFile_(modelUrl, modelStr)
            .then(() => this.writeFile_(modelHashUrl, hashStr));
      },
    },
    {
      name: 'importData_',
      code: function(arraySink) {
        const cls = arraySink.of;
        const data = this.dataOutputter.stringify(arraySink.array, cls);
        const hash = this.getHash_(data);
        const dataUrl = this.dataEnv.getDataUrl(cls.id, this.gcloudProjectId);
        const dataHashUrl = this.dataEnv.getDataHashUrl(
            cls.id, this.gcloudProjectId);
        return this.writeFile_(dataUrl, data)
            .then(() => this.writeFile_(dataHashUrl, hash));
      },
    },
    {
      name: 'writeFile_',
      code: function(urlStr, data) {
        const url = this.url_.parse(urlStr);
        if (url.protocol === 'file:') {
          const path = url.pathname;
          return new Promise(
              (resolve, reject) => this.fs_.writeFile(path, data,
                                                      err => err ?
                                                      reject(err) :
                                                      resolve()));
        } else {
          const prefix = this.dataEnv.getBaseUrl(this.gcloudProjectId) +'/';
          const path = url.substr(prefix.length);
          return this.storageBucketPromise_
              .then(bucket => bucket.file(path).save(data, {
                metadata: {
                  contentType: this.getContentType_(path),
                },
              }));
        }
      },
    },
    {
      name: 'getHash_',
      code: function(data) {
        return this.hashProvider.getHash(data);
      },
    },
    {
      name: 'getContentType_',
      code: function(path) {
        return path.endsWith('.json') ? 'application/json' : 'text/plain';
      },
    },
  ],
});
