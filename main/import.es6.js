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

    node /path/to/import.es6.js ConfluenceDataURL

        ConfluenceDataURL = absolute https: or file: URL to JSON for Confluence
                            GridRows.`;
if (process.argv.length !== 3) {
  console.error(USAGE);
  process.exit(1);
}

const dataUrl = url.parse(process.argv[2]);
if (dataUrl.protocol !== 'file:' && dataUrl.protocol !== 'https:') {
  console.error('ConfluenceDataURL parameter must be file: or https: URL');
}

let inputDAO = dataUrl.protocol === 'file:' ?
    chr.SerializableLocalJsonDAO.create({of: mdn.GridRow, path: dataUrl.pathname}) :
    chr.SerializableHttpJsonDAO.create({of: mdn.GridRow, url: url.format(dataUrl)});

inputDAO.select().then(arraySink => {
  logger.info(`${arraySink.array.length} API rows from Confluence`);
});
