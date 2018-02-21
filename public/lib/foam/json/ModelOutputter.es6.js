// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'foam.json',
  name: 'ModelOutputter',
  extends: 'foam.box.BoxJsonOutputter',

  requires: [
    'foam.json.Outputter',
  ],

  properties: [
    {
      name: 'strict',
      getter: function() { return false; },
      setter: function() { return false; },
    },
    {
      name: 'alwaysQuoteKeys',
      getter: function() { return false; },
      setter: function() { return false; },
    },
    {
      name: 'formatFunctionsAsStrings',
      getter: function() { return false; },
      setter: function() { return false; },
    },
  ],

  methods: [
    function outputFObject(o, opt_cls) {
      if (o.outputJSON && !foam.core.Property.isInstance(o)) {
        o.outputJSON(this);
      } else {
        this.outputFObject_(o, opt_cls);
      }
    },
  ],
});
