// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CodeLoader',

  imports: ['creationContext'],

  methods: [
    {
      name: 'maybeLoad',
      code: (async function(ctx) {
        const needsUpdate = await this.needsUpdate();
        if (!needsUpdate) return ctx;
        return this.classFactory(ctx);
      }),
    },
    {
      name: 'needsUpdate',
      code: (async function() { return false; }),
    },
    {
      name: 'classFactory',
      code: (async function maybeLoad() { return this.creationContext; }),
    },
  ],
});
