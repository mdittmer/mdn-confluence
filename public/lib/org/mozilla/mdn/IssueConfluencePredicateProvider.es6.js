// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'IssueConfluencePredicateProvider',
  extends: 'org.mozilla.mdn.BaseForeignPredicateProvider',

  requires: [
    'org.mozilla.mdn.Issue',
    'org.mozilla.mdn.generated.ConfluenceRow',
  ],

  properties: [
    {
      name: 'from',
      factory: function() { return this.Issue; },
    },
    {
      name: 'to',
      factory: function() { return this.ConfluenceRow; },
    },
    {
      name: 'setPredicateFromArray',
      value: function(array) {
        return this.predicate = this.IN(this.to.ID, array.map(o => o.apiId));
      },
    },
  ],
});
