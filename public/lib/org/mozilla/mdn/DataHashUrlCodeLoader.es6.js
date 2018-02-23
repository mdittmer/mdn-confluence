// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'DataHashUrlCodeLoader',
  extends: 'org.mozilla.mdn.CodeLoader',
  implements: ['org.mozilla.mdn.DataHashUrlComponent'],

  requires: ['foam.net.HTTPRequest'],
  imports: [
    'creationContext',
    'dataEnv',
    'info',
    'modelDAO?',
    'parser',
  ],

  properties: [
    {
      name: 'classUrl',
      expression: function(classId, gcloudProjectId) {
        return this.dataEnv.getModelUrl(classId, gcloudProjectId);
      },
    },
    {
      name: 'hashUrl',
      expression: function(gcloudProjectId, classId) {
        return this.dataEnv.getModelHashUrl(classId, gcloudProjectId);
      },
    },
  ],

  methods: [
    {
      name: 'maybeLoad',
      code: (async function() {
        this.validate();
        const needsUpdate = await this.needsUpdate();
        if (!needsUpdate) return this.creationContext;
        return this.classFactory();
      }),
    },
    {
      name: 'needsUpdate',
      code: (async function() {
        const newHash = await this.fetchFromUrl(this.hashUrl);
        this.info(`${this.cls_.id}.needsUpdate(): Comparing hashes
                      "${this.hash_}" and "${newHash}"`);
        return this.hash_ !== newHash;
      }),
    },
    {
      name: 'classFactory',
      code: (async function maybeLoad() {
        const specStr = await this.fetchFromUrl(this.classUrl);
        this.info(`${this.cls_.id}.classFactory(): Constructing class from
                      ${specStr}`);
        const model = this.parser.parseString(specStr);
        model.validate();
        const cls = model.buildClass();
        cls.validate();

        const oldCreationContext = this.creationContext;
        const newCreationContext = oldCreationContext.createSubContext({});
        newCreationContext.register(cls);
        foam.package.registerClass(cls);
        this.hash_ = this.hashProvider.getHash(specStr);

        // Swap out creation context and prevent creation from old context.
        let oldCls = oldCreationContext.lookup(cls.id, true);
        if (oldCls) oldCls.create = undefined;
        this.creationContext = newCreationContext;

        this.modelDAO && this.modelDAO.put(model);

        return ctx;
      }),
    },
  ],
});
