// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'HttpJsonDAO',
  package: 'org.mozilla.mdn',
  refines: 'org.chromium.apis.web.HttpJsonDAO',

  requires: ['foam.json.Parser'],

  properties: [
    {
      name: 'parser',
      factory: function() {
        // TODO(markdittmer): Add mdn-confluence whitelist.
        return this.Parser.create({strict: true});
      },
    },
  ],
});
