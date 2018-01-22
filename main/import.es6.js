// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const path = require('path');
const process = require('process');
const url = require('url');

const compat = require('mdn-browser-compat-data');

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

    node /path/to/import.es6.js ConfluenceReleaseURL ConfluenceDataURL

        ConfluenceReleaseURL = absolute https: or file: URL to JSON for
                               Confluence release metadata for GridRows.
        ConfluenceDataURL = absolute https: or file: URL to JSON for Confluence
                            GridRows.`;
if (process.argv.length !== 4) {
  console.error(USAGE);
  process.exit(1);
}

const releaseUrl = url.parse(process.argv[2]);
if (releaseUrl.protocol !== 'file:' && releaseUrl.protocol !== 'https:') {
  console.error('ConfluenceReleaseURL parameter must be file: or https: URL');
}
const dataUrl = url.parse(process.argv[3]);
if (dataUrl.protocol !== 'file:' && dataUrl.protocol !== 'https:') {
  console.error('ConfluenceDataURL parameter must be file: or https: URL');
}

const releaseDAO = releaseUrl.protocol === 'file:' ?
      chr.SerializableLocalJsonDAO.create({of: chr.Release, path: releaseUrl.pathname}) :
      chr.SerializableHttpJsonDAO.create({of: chr.Release, url: url.format(releaseUrl)});

(async function() {
  const releaseSink = await releaseDAO.select();
  const releases = releaseSink.array;


  let browserNameMap = {};
  for (const release of releases) {
    browserNameMap[release.browserName.toLowerCase()] = release.browserName;
  }

  const gridDAO = chr.GridDAO.create({
    cols: releases,
    of: mdn.GridRow,
    delegate: dataUrl.protocol === 'file:' ?
        chr.SerializableLocalJsonDAO.create({of: mdn.GridRow, path: dataUrl.pathname}) :
        chr.SerializableHttpJsonDAO.create({of: mdn.GridRow, url: url.format(dataUrl)}),
  });
  const ctx = foam.createSubContext({gridDAO});

  const rowSink = await gridDAO.select();
  const confluenceApis = rowSink.array;
  logger.info(`${confluenceApis.length} API rows from Confluence`);

  let confluenceApiMap = {};
  for (const api of confluenceApis) {
    confluenceApiMap[api.id] = api;
  }
  for (const iface of Object.keys(compat.api)) {
    if (iface.indexOf('__') !== -1) continue;
    for (const api of Object.keys(compat.api[iface])) {
      if (api.indexOf('__') !== -1) continue;
      const id = `${iface}#${api}`;
      let row = confluenceApiMap[id] ?
          confluenceApiMap[id].clone(ctx) :
          mdn.GridRow.create({id}, ctx);
      const compatMap = compat.api[iface][api].__compat.support;
      const compatKeys = Object.keys(compatMap)
          .filter(key => !!browserNameMap[key]);
      let versionInfos = [];
      for (const key of compatKeys) {
        if (!compatMap[key].version_added && !compatMap[key].version_removed) {
          logger.warn(`No version info for ${key}`);
          continue;
        }

        const versionInfo = mdn.VersionInfo.create({
          browserName: browserNameMap[key],
          versionAdded: compatMap[key].version_added || '',
          versionRemoved: compatMap[key].version_removed || '',
        }, ctx);
        versionInfo.getConfluenceAnomalies(row);
        versionInfos.push(versionInfo);
      }
      row.compatVersionInfo = versionInfos;
      gridDAO.put(row);
    }
  }
})();
