// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const fs = require('fs');
const process = require('process');

global.FOAM_FLAGS = {firebase: true};
require('foam2');

require('./node_modules/web-api-confluence-dashboard/lib/indexed_dao.es6.js');
require('./node_modules/web-api-confluence-dashboard/lib/http_json_dao.es6.js');
require('./node_modules/web-api-confluence-dashboard/lib/local_json_dao.es6.js');
require('./node_modules/web-api-confluence-dashboard/lib/web_apis/release.es6.js');
global.chr = org.chromium.apis.web;

require('./public/lib/foam/dao/WebSocketDAOProvider.es6.js');
require('./public/lib/org/mozilla/mdn/property.es6.js');
require('./public/lib/org/mozilla/mdn/LocalJsonDAO.es6.js');
require('./public/lib/org/mozilla/mdn/HttpJsonDAO.es6.js');
require('./public/lib/org/mozilla/mdn/GridProperty.es6.js');
require('./public/lib/org/mozilla/mdn/BrowserInfo.es6.js');
require('./public/lib/org/mozilla/mdn/BrowserInfoProperty.es6.js');
require('./public/lib/org/mozilla/mdn/CompatClassGenerator.es6.js');
require('./public/lib/org/mozilla/mdn/ConfluenceClassGenerator.es6.js');
require('./public/lib/org/mozilla/mdn/IssueType.es6.js');
require('./public/lib/org/mozilla/mdn/IssueStatus.es6.js');
require('./public/lib/org/mozilla/mdn/Issue.es6.js');
require('./public/lib/org/mozilla/mdn/ForkedJsonDAO.es6.js');
require('./public/lib/org/mozilla/mdn/HashProvider.es6.js');
require('./public/lib/org/mozilla/mdn/DataHashUrlComponent.es6.js');
require('./public/lib/org/mozilla/mdn/PollingDAO.es6.js');
require('./public/lib/org/mozilla/mdn/DataHashUrlPollingDAO.es6.js');
require('./public/lib/org/mozilla/mdn/CodeLoader.es6.js');
require('./public/lib/org/mozilla/mdn/DataHashUrlCodeLoader.es6.js');
global.mdn = org.mozilla.mdn;

let ctxConfig = {
  gcloudProjectId: process.env.GCLOUD_PROJECT || 'mdn-confluence',
};
const credentialsPath = `${__dirname}/.local/credentials.json`;
if (fs.existsSync(credentialsPath)) {
  ctxConfig.gcloudCredentialsPath = credentialsPath;
}
const boxContext = foam.box.Context.create();
const ctx = boxContext.__subContext__.createSubContext(ctxConfig);

foam.boxContext = boxContext;
foam.__context__ = ctx;
