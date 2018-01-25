// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const fs = require('fs');
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

require('../lib/org/mozilla/mdn/GridProperty.es6.js');
require('../lib/org/mozilla/mdn/BrowserInfo.es6.js');
require('../lib/org/mozilla/mdn/CompatRow.es6.js');
require('../lib/org/mozilla/mdn/ConfluenceClassGenerator.es6.js');

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


const outputter = foam.json.Outputter.create({
  pretty: false,
  formatDatesAsNumbers: true,
  outputDefaultValues: false,
  useShortNames: false,
  strict: true,
});
const foamStore = (dataDir, src, opt_name) => {
  let cls = src.cls_;
  if (foam.dao.ArraySink.isInstance(src)) {
    cls = src.of || src.array[0] ? src.array[0].cls_ :
        foam.core.FObject;
    src = src.array;
  }
  foam.assert(cls || opt_name, 'foamStore: Must specify class or name');
  logger.info(`Storing ${opt_name ? opt_name : cls.id}`);
  return new Promise((resolve, reject) => {
    let filePath = `${__dirname}/../data/${dataDir}/${opt_name || cls.id}.json`;
    let dirName = path.dirname(filePath);
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }
    fs.writeFile(
        filePath,
        outputter.stringify(src, cls),
        error => {
          if (error) {
            logger.error(`Error storing ${opt_name ? opt_name : cls.id}`,
                         error);
            reject(error);
          } else {
            logger.info(`Stored ${opt_name ? opt_name : cls.id}`);
            resolve();
          }
        });
  });
};

let confluenceDAO;
let mdnDAO;
let issueDAO;
(async function() {
  const releaseSink = await releaseDAO.select();
  const releases = releaseSink.array;

  let browserNameMap = {};
  for (const release of releases) {
    browserNameMap[release.browserName.toLowerCase()] = release.browserName;
  }

  const confluenceClassGenerator =
        mdn.ConfluenceClassGenerator.create();
  const confluenceRowSpec = confluenceClassGenerator
        .generateSpec('org.mozilla.mdn.generated', 'ConfluenceRow', releases);
  const ConfluenceRow = confluenceClassGenerator.
        generateClass(confluenceRowSpec);

  return Promise.all([
    (async function() {
      confluenceDAO = foam.dao.MDAO.create({of: ConfluenceRow});

      const gridDAO = chr.GridDAO.create({
        cols: releases,
        of: chr.GridRow,
        delegate: dataUrl.protocol === 'file:' ?
            chr.SerializableLocalJsonDAO.create({of: chr.GridRow, path: dataUrl.pathname}) :
        chr.SerializableHttpJsonDAO.create({of: chr.GridRow, url: url.format(dataUrl)}),
      });
      const ctx = foam.createSubContext({gridDAO});

      const rowSink = await gridDAO.select();
      const confluenceApis = rowSink.array;
      logger.info(`${confluenceApis.length} API rows from Confluence`);

      for (const api of confluenceApis) {
        confluenceDAO.put(ConfluenceRow.create(null, ctx).fromGridRow(api));
      }

      const confluenceRows = await confluenceDAO.select(
          foam.dao.ArraySink.create({of: ConfluenceRow}));
      return Promise.all([
        foamStore('confluence', confluenceRowSpec, `class:${ConfluenceRow.id}`),
        foamStore('confluence', confluenceRows),
      ]);
    })(),
    (async function() {
      const mdnData = require('mdn-browser-compat-data');
      mdnDAO = foam.dao.MDAO.create({of: mdn.CompatRow});
      for (const iface of Object.keys(mdnData.api)) {
        if (iface.indexOf('__') !== -1) continue;
        for (const api of Object.keys(mdnData.api[iface])) {
          if (api.indexOf('__') !== -1) continue;
          mdnDAO.put(mdn.CompatRow.create({
            id: `${iface}#${api}`,
          }).fromMdnData(mdnData.api[iface][api], browserNameMap));
        }
      }
      const mdnRows = await mdnDAO.select(
          foam.dao.ArraySink.create({of: mdn.CompatRow}));
      return foamStore('mdn', mdnRows);
    })(),
  ]);
})().then(async function() {
  require('../lib/org/mozilla/mdn/IssueType.es6.js');
  require('../lib/org/mozilla/mdn/IssueStatus.es6.js');
  require('../lib/org/mozilla/mdn/Issue.es6.js');
  require('../lib/org/mozilla/mdn/VersionIssueGenerator.es6.js');

  issueDAO = await mdn.VersionIssueGenerator.create()
      .generateIssues(confluenceDAO, mdnDAO, foam.dao.MDAO.create({
        of: mdn.Issue,
      }));
  const issueRows = await issueDAO.select(
      foam.dao.ArraySink.create({of: mdn.Issue}));
  return foamStore('issues', issueRows);
}).then(() => logger.info('DONE'));
