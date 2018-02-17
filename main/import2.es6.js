// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const fs = require('fs');

global.FOAM_FLAGS = {firebase: true};
require('foam2');

// TODO(markdittmer): Better expose Confluence modules.
require('../node_modules/web-api-confluence-dashboard/lib/grid_dao.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/http_json_dao.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/json_dao_container.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/local_json_dao.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/web_apis/release.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/web_apis/release_interface_relationship.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/web_apis/web_interface.es6.js');
const chr = org.chromium.apis.web;

require('../public/lib/org/mozilla/mdn/property.es6.js');
require('../public/lib/org/mozilla/mdn/BaseImporter.es6.js');
require('../public/lib/org/mozilla/mdn/ConfluenceImporter.es6.js');
require('../public/lib/org/mozilla/mdn/CompatImporter.es6.js');
require('../public/lib/org/mozilla/mdn/GridProperty.es6.js');
require('../public/lib/org/mozilla/mdn/BrowserInfo.es6.js');
require('../public/lib/org/mozilla/mdn/BrowserInfoProperty.es6.js');
require('../public/lib/org/mozilla/mdn/CompatClassGenerator.es6.js');
require('../public/lib/org/mozilla/mdn/ConfluenceClassGenerator.es6.js');
const mdn = org.mozilla.mdn;

let ctxConfig = {gcloudProjectId: 'mdn-confluence'};
const credentialsPath = `${__dirname}/../.local/credentials.json`;
if (fs.existsSync(credentialsPath)) {
  ctxConfig.gcloudCredentialsPath = credentialsPath;
}
const ctx = foam.createSubContext(ctxConfig);
const confluenceImporter = mdn.ConfluenceImporter.create(null, ctx);
const compatImporter = mdn.CompatImporter.create(null, ctx);

Promise.all([
  confluenceImporter.importClassAndData(),
  compatImporter.importClassAndData(),
]);
