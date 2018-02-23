// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// TODO(markdittmer): In DataEnv.TEST or DataEnv.DEV mode, this abuses the
// notion of generated code. We produce a class model for Issue (which is not
// supposed to be a generated class), and then (on the server) use a
// PollingDAO that polls on the generated version of the Issue class.
foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'IssuesImporter',
  implements: ['org.mozilla.mdn.BaseImporter'],

  requires: [
    'com.google.firebase.FirestoreDAO',
    'foam.dao.ArraySink',
    'foam.dao.MDAO',
    'org.mozilla.mdn.Issue',
    'org.mozilla.mdn.VersionIssueGenerator',
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'confluenceDAO',
      required: true,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'compatDAO',
      required: true,
    },
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.VersionIssueGenerator',
      name: 'versionIssueGenerator',
      factory: function() {
        return this.VersionIssueGenerator.create();
      },
    },
  ],

  methods: [
    {
      name: 'generateDataClass',
      code: (async function() {
        return this.Issue;
      }),
    },
    {
      name: 'getDAO',
      code: (async function() {
        if (this.dao_) return this.dao_;
        const Cls = await this.generateDataClass();

        return this.dao_ = this.dataEnv.backendIsRemote ?
            this.FirestoreDAO.create({
              collectionPath: 'issues',
              of: mdn.Issue,
            }) : this.MDAO.create({of: Cls});
      }),
    },
    {
      name: 'importClassAndData',
      code: (async function(pathToJsonOutput) {
        const Cls = await this.generateDataClass();
        let dao = await this.getDAO();

        this.validate();

        dao = await this.versionIssueGenerator.generateIssues(
            this.confluenceDAO,
            this.compatDAO,
            dao);
        const arraySink = await dao.orderBy(dao.of.ID).select(
            this.ArraySink.create({of: dao.of}));

        return Promise.all([
          this.generateDataClass().then(this.importClass_.bind(this)),
          this.importData_(arraySink),
        ]).then(() => arraySink);
      }),
    },
  ],
});
