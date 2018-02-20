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
    'gcloudProjectId',
    'gcloudCredentialsPath',
  ],

  properties: [
    {
      name: 'releaseJsonUrl',
      factory: function() {
        return this.url_.parse(`https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.Release.json`);
      },
      adapt: function(_, nu) {
        if ( foam.String.isInstance(nu) ) return this.url_.parse(nu);
        return nu;
      },
    },
    {
      class: 'String',
      name: 'classFonPath',
      factory: function() {
        return `class:${this.dataClass_.id}.txt`;
      },
    },
    {
      class: 'String',
      name: 'classHashPath',
      factory: function() {
        return `class:${this.dataClass_.id}.txt.md5sum`;
      },
    },
    {
      class: 'String',
      name: 'dataJsonPath',
      factory: function() {
        return `${this.dataClass_.id}.json`;
      },
    },
    {
      class: 'String',
      name: 'dataHashPath',
      factory: function() {
        return `${this.dataClass_.id}.json.md5sum`;
      },
    },
    {
      name: 'classOutputter',
      factory: function() {
        return this.Outputter.create({
          pretty: false,
          formatDatesAsNumbers: true,
          outputDefaultValues: false,
          useShortNames: false,
          strict: false,
        });
      },
    },
    {
      name: 'dataOutputter',
      factory: function() {
        return this.Outputter.create({
          pretty: false,
          formatDatesAsNumbers: true,
          outputDefaultValues: false,
          useShortNames: false,
          strict: true,
        });
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
      code: function(spec) {
        let specStr = this.classOutputter.stringify(spec);
        const hashStr = this.getHash_(specStr);
        return this.writeFile_(this.classFonPath, specStr)
            .then(() => this.writeFile_(this.classHashPath, hashStr));
      },
    },
    {
      name: 'importData_',
      code: function(arraySink) {
        const data = this.dataOutputter.stringify(
            arraySink.array, arraySink.of);
        const hash = this.getHash_(data);
        return this.writeFile_(this.dataJsonPath, data)
            .then(() => this.writeFile_(this.dataHashPath, hash));
      },
    },
    {
      name: 'readFile_',
      code: function(path) {
        return this.storageBucketPromise_
            .then(bucket => new Promise((resolve, reject) => {
                const stream = bucket.file(path).createReadStream();
                let bufs = [];
                stream.on('error', reject);
                stream.on('data', data => bufs.push(data));
                stream.on('end', () => resolve(Buffer.concat(bufs).toString()));
            }));
      },
    },
    {
      name: 'writeFile_',
      code: function(path, data) {
        return this.storageBucketPromise_
            .then(bucket => bucket.file(path).save(data, {
              metadata: {
                contentType: this.getContentType_(path),
              },
            }));
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
