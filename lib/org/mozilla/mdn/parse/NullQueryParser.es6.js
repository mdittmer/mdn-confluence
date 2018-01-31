// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn.parse',
  name: 'NullQueryParser',
  implements: ['foam.mlang.Expressions'],

  methods: [
    function parseString() {
      return this.TRUE;
    },
  ],
});
