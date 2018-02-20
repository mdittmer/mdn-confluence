// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DataHashUrlPollingDAO',
  extends: 'org.mozilla.mdn.PollingDAO',
  implements: ['org.mozilla.mdn.DataHashUrlComponent'],

  requires: [
    'foam.net.HTTPRequest',
    'org.mozilla.mdn.DataHashUrlCodeLoader',
    'org.mozilla.mdn.ForkedJsonDAO',
  ],
  imports: [
    'error',
    'info',
  ],

  properties: [
    {
      name: 'dataUrl',
      expression: function(gcloudProjectId, classId) {
        return `https://storage.googleapis.com/${gcloudProjectId}.appspot.com/${classId}.json`;
      },
    },
    {
      name: 'hashUrl',
      expression: function(gcloudProjectId, classId) {
        return `https://storage.googleapis.com/${gcloudProjectId}.appspot.com/${classId}.json.md5sum`;
      },
    },
    {
      class: 'FObjectProperty',
      of: 'org.mozilla.mdn.CodeLoader',
      name: 'codeLoader',
      factory: function() {
        return this.DataHashUrlCodeLoader.create({
          classId: this.classId,
        });
      },
    },
    {
      class: 'String',
      name: 'nextHash_',
    },
  ],

  methods: [
    {
      name: 'needsUpdate',
      code: (async function() {
        this.nextHash_ = await this.fetchFromUrl(this.hashUrl);
        this.info(`${this.cls_.id} from ${this.dataUrl} by ${this.hashUrl}: Comparing hashes "${this.hash_}" and "${this.nextHash_}"`);
        return this.hash_ !== this.nextHash_;
      }),
    },
    {
      name: 'delegateFactory',
      code: (async function() {
        // (Maybe) reload generated classses in sub-context.
        const ctx = await this.codeLoader.maybeLoad();
        const of = ctx.lookup(this.classId);

        this.info(`${this.cls_.id} from ${this.dataUrl} by ${this.hashUrl}: Providing new ${this.ForkedJsonDAO.id}`);
        // Create new ForkedJsonDAO (with new fork). PollingDAO will detach()
        // any old fork, triggering registry.unregister() + child.kill() on old
        // DAO (if applicable).
        const newDelegate = this.ForkedJsonDAO.create({
          of,
          url: this.dataUrl,
        }, ctx);

        // Wait for DAO to start deliving results, then lock in new hash.
        //
        // TODO(markdittmer): Could this be racey if multiple delegate update
        // attempts wind up in flight at the same time?
        const newHash = this.nextHash_;
        newDelegate.limit(1).select().then(() => {
          this.info(`${this.cls_.id} from ${this.dataUrl} by ${this.hashUrl}: New delegate serving results; locking in new hash: ${newHash}`);
          this.hash_ = newHash;
        }, err => {
          this.error(`${this.cls_.id} from ${this.dataUrl} by ${this.hashUrl}: Failed to serve new results; skipping hash update`);
        });

        return newDelegate;
      }),
    },
  ],
});
