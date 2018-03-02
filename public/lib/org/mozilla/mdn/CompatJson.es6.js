// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatJson',

  requires: [
    'foam.net.HTTPRequest',
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
    {
      name: 'mdnData_',
      factory: function() { return require('mdn-browser-compat-data'); },
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
    function fromGithubRef(ref) {
      return this.HTTPRequest.create({
        url: `https://raw.githubusercontent.com/mdn/browser-compat-data/${ref}/${this.compatDir}/${this.interfaceName}.json`,
      }).send()
          .then(resp => {
            if ( resp.status !== 200 ) throw resp;
            return resp.payload;
          }).then(str => this.json = JSON.parse(str)).then(() => this);
    },
    function fromNpmModule() {
      let mdnData = this.mdnData_;
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
