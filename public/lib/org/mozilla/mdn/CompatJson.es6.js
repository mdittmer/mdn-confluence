// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatJson',

  requires: [
    'org.mozilla.mdn.CompatJsonAdapter',
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      expression: function(compatDir, interfaceName) {
        return `${compatDir}/${interfaceName}`;
      },
    },
    {
      class: 'String',
      name: 'compatDir',
      value: 'api'
    },
    {
      class: 'String',
      name: 'interfaceName',
      required: true,
    },
    {
      class: 'Object',
      name: 'json',
      factory: function() {
        const parts = this.compatDir.split('/');
        let json = {};
        let data = json;
        for (const part of parts) {
          data = data[part] = {};
        }
        return json;
      },
    },
  ],

  methods: [
    function getInterfacesJson() {
      const parts = this.compatDir.split('/');
      let data = this.json;
      for (const part of parts) {
        data = data[part];
      }
      return data;
    },
    function fromNpmModule(bcd) {
      let mdnData = bcd;
      const parts = this.compatDir.split('/');
      let data = this.json;
      for (const part of parts) {
        data = data[part];
        mdnData = mdnData[part];
      }
      data = data[this.interfaceName] || (data[this.interfaceName] = {});
      if (!mdnData[this.interfaceName]) return this;
      mdnData = mdnData[this.interfaceName];

      this.CompatJsonAdapter.create().patch(data, mdnData);
      return this;
    },
  ],
});
