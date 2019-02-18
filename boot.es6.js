// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const fs = require('fs');
const process = require('process');

require('foam2');

require('web-api-confluence-dashboard/lib/indexed_dao.es6.js');
require('web-api-confluence-dashboard/lib/http_json_dao.es6.js');
require('web-api-confluence-dashboard/lib/grid_dao.es6.js');
require('web-api-confluence-dashboard/lib/local_json_dao.es6.js');
require('web-api-confluence-dashboard/lib/web_apis/release.es6.js');
global.chr = org.chromium.apis.web;

require('./public/lib/org/mozilla/mdn/property.es6.js');
require('./public/lib/org/mozilla/mdn/views.es6.js');
require('./public/lib/foam/json/ModelOutputter.es6.js');
require('./public/lib/foam/json/ModelParser.es6.js');
require('./public/lib/foam/dao/WebSocketDAOProvider.es6.js');
require('./public/lib/org/mozilla/mdn/DataEnv.es6.js');
require('./public/lib/org/mozilla/mdn/LocalJsonDAO.es6.js');
require('./public/lib/org/mozilla/mdn/HttpJsonDAO.es6.js');
require('./public/lib/org/mozilla/mdn/GridProperty.es6.js');
require('./public/lib/org/mozilla/mdn/BrowserInfo.es6.js');
require('./public/lib/org/mozilla/mdn/BrowserInfoProperty.es6.js');
require('./public/lib/org/mozilla/mdn/CompatClassGenerator.es6.js');
require('./public/lib/org/mozilla/mdn/ConfluenceClassGenerator.es6.js');
require('./public/lib/org/mozilla/mdn/CompatJsonAdapter.es6.js');
require('./public/lib/org/mozilla/mdn/CompatJson.es6.js');
require('./public/lib/org/mozilla/mdn/CompatConfluenceJsonGenerator.es6.js');
require('./public/lib/org/mozilla/mdn/IssueType.es6.js');
require('./public/lib/org/mozilla/mdn/IssueStatus.es6.js');
require('./public/lib/org/mozilla/mdn/Issue.es6.js');
require('./public/lib/org/mozilla/mdn/VersionIssueGenerator.es6.js');
require('./public/lib/org/mozilla/mdn/HashProvider.es6.js');
require('./public/lib/org/mozilla/mdn/DataHashUrlComponent.es6.js');
require('./public/lib/org/mozilla/mdn/PollingDAO.es6.js');
require('./public/lib/org/mozilla/mdn/DataHashUrlPollingDAO.es6.js');
require('./public/lib/org/mozilla/mdn/CodeLoader.es6.js');
require('./public/lib/org/mozilla/mdn/DataHashUrlCodeLoader.es6.js');
require('./public/lib/org/mozilla/mdn/BaseImporter.es6.js');
require('./public/lib/org/mozilla/mdn/ConfluenceImporter.es6.js');
require('./public/lib/org/mozilla/mdn/CompatImporter.es6.js');
require('./public/lib/org/mozilla/mdn/WebSocketServer.es6.js');
require('./public/lib/org/mozilla/mdn/ContextProvider.es6.js');
require('./public/lib/org/mozilla/mdn/ServerContextProvider.es6.js');
require('./public/lib/org/mozilla/mdn/WebServerContextProvider.es6.js');
require('./public/lib/org/mozilla/mdn/InfraServerContextProvider.es6.js');
global.mdn = org.mozilla.mdn;
