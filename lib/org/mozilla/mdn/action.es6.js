// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'Action',
  refines: 'foam.core.Action',

  requires: [
    'foam.u2.ViewSpec',
    'org.mozilla.mdn.ActionView',
  ],

  methods: [
    function toE(args, ctx) {
      let view = this.ViewSpec.createView(
          {class: 'org.mozilla.mdn.ActionView', action: this},
          args, this, ctx);

      if (ctx.data$ && !(args && (args.data || args.data$))) {
        view.data$ = ctx.data$;
      }

      return view;
    },
  ],
});
