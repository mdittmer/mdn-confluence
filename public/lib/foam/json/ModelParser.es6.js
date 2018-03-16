// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'foam.json',
  name: 'ModelParser',
  extends: 'foam.json.Parser',

  methods: [
    function parseString(str, opt_ctx) {
      return this.parseClassFromString(str, null, opt_ctx);
    },
    function parseClassFromString(str, opt_cls, opt_ctx) {
      return foam.json.parse(eval(`(${str})`), opt_cls, opt_ctx);
    },
  ],
});
