// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'HashProvider',

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'md5',
    },
    {
      class: 'String',
      name: 'encoding',
      value: 'hex',
    },
    {
      name: 'crypto_',
      factory: function() { return require('crypto'); },
    },
  ],

  methods: [
    function getHash(data) {
      var hash = this.crypto_.createHash(this.algorithm);
      hash.update(data);
      return hash.digest(this.encoding);
    },
  ],
});
