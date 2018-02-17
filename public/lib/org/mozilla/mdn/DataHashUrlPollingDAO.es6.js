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
  ],

  methods: [
    {
      name: 'needsUpdate',
      code: (async function() {
        const newHash = await this.fetchFromUrl(this.hashUrl);
        return this.hash_ !== newHash;
      }),
    },
    {
      name: 'delegateFactory',
      code: (async function() {
        // (Maybe) reload generated classses in sub-context.
        const ctx = await this.codeLoader.maybeLoad();
        const of = ctx.lookup(this.classId);

        // Crete new ForkedJsonDAO (with new fork). PollingDAO will detach() any
        // old fork, triggering registry.unregister() + child.kill() on old DAO
        // (if applicable).
        return this.ForkedJsonDAO.create({of, url: this.dataUrl}, ctx);
      }),
    },
  ],
});
