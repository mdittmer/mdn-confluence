// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const path = require('path');
const process = require('process');
const url = require('url');

require('foam2');

// TODO(markdittmer): Better expose Confluence modules.
require('../node_modules/web-api-confluence-dashboard/lib/grid_dao.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/http_json_dao.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/json_dao_container.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/local_json_dao.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/web_apis/release.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/web_apis/release_interface_relationship.es6.js');
require('../node_modules/web-api-confluence-dashboard/lib/web_apis/web_interface.es6.js');

require('../lib/org/mozilla/mdn/GridRow.es6.js');

const chr = org.chromium.apis.web;
const mdn = org.mozilla.mdn;

const logger = foam.log.ConsoleLogger.create();

const USAGE = `USAGE:

    node /path/to/import.es6.js BaseConfluenceDataURL

        BaseConfluenceDataURL = absolute https: or file: URL to directory
                                where Confluence data are stored with NO
                                trailing slash.`;
if (process.argv.length !== 3) {
  console.error(USAGE);
  process.exit(1);
}

const dataUrl = url.parse(process.argv[2]);
if (dataUrl.protocol !== 'file:' && dataUrl.protocol !== 'https:') {
  console.error('BaseConfluenceDataURL parameter must be file: or https: URL');
}

let container = chr.JsonDAOContainer.create({
  mode: dataUrl.protocol === 'file:' ? chr.JsonDAOContainerMode.LOCAL :
      chr.JsonDAOContainerMode.HTTP,
  basename: dataUrl.protocol === 'file:' ? dataUrl.pathname : url.format(dataUrl),
}, logger);

const E = foam.mlang.ExpressionsSingleton.create();

Promise.all([
  container.releaseDAO.select(E.COUNT())
      .then(countSink => console.log(countSink.value, 'releases')),
  container.webInterfaceDAO.select(E.COUNT())
      .then(countSink => console.log(countSink.value, 'APIs')),
  container.releaseWebInterfaceJunctionDAO.select(E.COUNT())
      .then(countSink => console.log(countSink.value, 'release <--> APIs')),
]).then(function() {
  console.log('DONE');
});
