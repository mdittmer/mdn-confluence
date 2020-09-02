// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const { CompatJsonAdapter } = require('./CompatJsonAdapter.es6.js');

class CompatJson {
  constructor(compatDir, interfaceName) {
    this.compatDir = compatDir;
    this.interfaceName = interfaceName;

    this.id = `${compatDir}/${interfaceName}`;

    // Create this.json.
    const parts = compatDir.split('/');
    this.json = {};
    let data = this.json;
    for (const part of parts) {
      data = data[part] = {};
    }
  }

  getInterfacesJson() {
    const parts = this.compatDir.split('/');
    let data = this.json;
    for (const part of parts) {
      data = data[part];
    }
    return data;
  }

  fromNpmModule(bcd) {
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

    const adapter = new CompatJsonAdapter();
    adapter.patch(data, mdnData);
    return this;
  }
}

module.exports = { CompatJson };
