// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'Version',

  constants: {
    CLASS_SERIALIZER: foam.json.Outputter.create({
      pretty: false,
      formatDatesAsNumbers: true,
      outputDefaultValues: false,
      useShortNames: false,
      strict: false,
    }),
  },

  properties: [
    {
      class: 'String',
      name: 'id',
      required: true,
    },
    {
      class: 'String',
      name: 'version',
      required: true,
    },
    {
      class: 'String',
      name: 'cls',
      required: true,
      adapt: function(_, nu) {
        return this.CLASS_SERIALIZER.stringify(nu);
      },
    },
  ],
});
