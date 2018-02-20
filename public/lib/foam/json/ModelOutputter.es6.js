// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'foam.json',
  name: 'ModelOutputter',
  extends: 'foam.json.Outputter',

  methods: [
    function init() {
      // TODO(markdittmer): foam.json.Outputter uses postSet to change state to
      // non-default values; changing the underlying default value with
      // "value: ..." will not trigger a property change event, and using
      // "factory: ..." doesn't work either because nothing accesses the value.
      this.strict = false;
      this.SUPER();
    },
    function outputFObject(o, opt_cls) {
      if ( o.outputJSON && !foam.core.Property.isInstance(o) ) {
        o.outputJSON(this);
      } else {
        this.outputFObject_(o, opt_cls);
      }
    },
  ],
});
