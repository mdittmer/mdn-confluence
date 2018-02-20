// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'LocalJsonDAO',
  package: 'org.mozilla.mdn',
  refines: 'org.chromium.apis.web.LocalJsonDAO',

  requires: ['foam.json.Parser'],
  imports: [
    'error',
    'info',
  ],

  properties: [
    {
      name: 'parser',
      factory: function() {
        // TODO(markdittmer): Add mdn-confluence whitelist.
        return this.Parser.create({strict: true});
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.info(`${this.cls_.id} of ${this.of.id} created from ${this.path}`);
      this.promise.then(
        dao => this.info(`Promised ${this.cls_.id} of ${this.of.id} from ${this.path} resolved as ${dao.cls_.id}`),
        err => this.error(`Promised ${this.cls_.id} of ${this.of.id} from ${this.path} rejected with ${err}`)
      );
    },
  ],
});
