// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const fs = require('fs');
const process = require('process');
const url = require('url');

const argv = require('yargs')
      .help('h')
      .option('confluence-release-url', {
        alias: 'cru',
        desc: `Absolute https: or file: URL to JSON for Confluence release metadata for GridRows`,
        default: `https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.Release.json`,
        coerce: cru => {
          if (!/^(https|file):[/][/]/i.test(cru)) {
            throw new Error('Invalid confluence-release-url: ${cru}');
          }
          return cru;
        },
      })
      .option('confluence-data-url', {
        alias: 'cdu',
        desc: `Absolute https: or file: URL to JSON for Confluence GridRows`,
        default: `https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.GridRow.json`,
        coerce: cdu => {
          if (!/^(https|file):[/][/]/i.test(cdu)) {
            throw new Error('Invalid confluence-data-url: ${cdu}');
          }
          return cdu;
        },
      })
      .option('update-confluence-data', {
        type: 'boolean',
        desc: `Update Confluence data from given URLs`,
        default: false,
      })
      .option('update-mdn-data', {
        type: 'boolean',
        desc: `Update MDN compat data from node_modules/mdn-browser-compat-data`,
        default: true,
      })
      .option('update-issues', {
        type: 'boolean',
        desc: `Update programmatically generated issues from Confluence/MDN inconsistencies`,
        default: true,
      })
      .option('clobber-issues', {
        type: 'boolean',
        desc: `Clobber existing issues. WARNING: THIS WILL OVERWRITE EXISTING ISSUE STATE!`,
        default: false,
      })
      .argv;

const dateID = (new Date()).toISOString();

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

require('../public/lib/org/mozilla/mdn/property.es6.js');
require('../public/lib/org/mozilla/mdn/Version.es6.js');
require('../public/lib/org/mozilla/mdn/GridProperty.es6.js');
require('../public/lib/org/mozilla/mdn/BrowserInfo.es6.js');
require('../public/lib/org/mozilla/mdn/BrowserInfoProperty.es6.js');
require('../public/lib/org/mozilla/mdn/CompatClassGenerator.es6.js');
require('../public/lib/org/mozilla/mdn/ConfluenceClassGenerator.es6.js');

const projectId = process.env.GCLOUD_PROJECT || 'mdn-confluence';
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore({
  projectId,
  keyFilename: `${__dirname}/../.local/credentials.json`,
});

const chr = org.chromium.apis.web;
const mdn = org.mozilla.mdn;

const logger = foam.log.ConsoleLogger.create();

const releaseUrl = url.parse(argv.cru);
const dataUrl = url.parse(argv.cdu);

const releaseDAO = releaseUrl.protocol === 'file:' ?
      chr.SerializableLocalJsonDAO.create({
        of: chr.Release,
        path: releaseUrl.pathname,
      }) :
      chr.SerializableHttpJsonDAO.create({
        of: chr.Release,
        url: url.format(releaseUrl),
        safePathPrefixes: [`/${projectId}.appspot.com/`],
      });

let confluenceDAO;
let mdnDAO;
let issuesDAO;
let latests;
(async function() {
  //
  // Establish latest version of versioned collections.
  //
  const latestCollection = firestore.collection('latest');
  const latestDAO = com.google.firebase.FirestoreDAO.create({
    of: mdn.Version,
    firestore,
    collection: latestCollection,
  });
  const latestSink = await latestDAO.select();
  latests = latestSink.array.reduce((acc, latest) => acc[latest.id] = latest, {});

  //
  // Generate Confluence class.
  //
  const releaseSink = await releaseDAO.orderBy(chr.Release.RELEASE_DATE).select();
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

  //
  // Generate MDN/Compat class.
  //
  const mdnData = require('mdn-browser-compat-data');

  const getBrowserName = mdn.CompatClassGenerator
        .getAxiomByName('browserNameFromMdnKey').code;
  const getPropName = mdn.CompatClassGenerator
        .getAxiomByName('propNameFromMdnKey').code;

  const mdnApis = Object.assign(
      {}, mdnData.api, mdnData.javascript.builtins);

  let browserInfoPropMap = {};
  for (const iface of Object.keys(mdnApis)) {
    if (iface.indexOf('__') !== -1) continue;
    for (const api of Object.keys(mdnApis[iface])) {
      if (/[^a-z]/i.test(api) ||
          !(mdnApis[iface][api].__compat &&
            mdnApis[iface][api].__compat.support)) {
        continue;
      }
      const keys = Object.keys(mdnApis[iface][api].__compat.support);
      for (const key of keys) {
        if (browserInfoPropMap[key]) continue;
        const browserName = getBrowserName(key);
        browserInfoPropMap[key] = {
          class: 'org.mozilla.mdn.BrowserInfoProperty',
          name: getPropName(key),
          label: browserName,
          browserName: browserName,
        };
      }
    }
  }
  let browserInfoProps = [];
  for (const key of Object.keys(browserInfoPropMap)) {
    browserInfoProps.push(browserInfoPropMap[key]);
  }
  const compatClassGenerator =
        mdn.CompatClassGenerator.create();
  const compatRowSpec = compatClassGenerator
        .generateSpec('org.mozilla.mdn.generated', 'CompatRow', browserInfoProps);
  const CompatRow = compatClassGenerator.
        generateClass(compatRowSpec);

  //
  // Establish Firebase collections and DAOs for Confluence, MDN/Compat, Issues.
  //
  const confluenceVersion = argv.updateConfluenceData || !latests.confluence ?
        dateID : latests.confluence.version;
  if (!argv.updateConfluenceData && !latests.confluence) {
    logger.warn(`No latest Confluence data found; updating`);
  }
  const confluenceCollection = firestore.collection(`confluence_${confluenceVersion}`);

  const mdnVersion = argv.updateMdnData || !latests.mdn ?
        dateID : latests.mdn.version;
  if (!argv.updateMdnData && !latests.mdn) {
    logger.warn(`No latest MDN data found; updating`);
  }
  const mdnCollection = firestore.collection(`mdn_${mdnVersion}`);

  const issuesCollection = firestore.collection('issues');

  confluenceDAO = com.google.firebase.FirestoreDAO.create({
    of: ConfluenceRow,
    firestore,
    collection: confluenceCollection,
  });
  mdnDAO = com.google.firebase.FirestoreDAO.create({
    of: CompatRow,
    firestore,
    collection: mdnCollection,
  });
  issuesDAO = com.google.firebase.FirestoreDAO.create({
    of: mdn.Issue,
    firestore,
    collection: issuesCollection,
  });

  //
  // Edge case: Setup latests if they're missing
  //
  latests.confluence = latests.confluence ||
      mdn.Version.create({id: 'confluence'});
  latests.mdn = latests.mdn ||
      mdn.Version.create({id: 'mdn'});

  return Promise.all([
    //
    // Confluence update
    //
    (async function() {
      if (!argv.updateConfluenceData) return Promise.resolve();

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
      latests.confluence.version = dateID;
      latests.confluence.cls = confluenceRowSpec;
      return Promise.all(
          confluenceApis.map(api => confluenceDAO.put(
              ConfluenceRow.create(null, ctx).fromGridRow(api))))
          .then(() => latestDAO.put(latests.confluence));
    })(),
    //
    // MDN/Compat update
    //
    (async function() {
      if (!argv.updateMdnData) return Promise.resolve();

      let promises = [];
      for (const iface of Object.keys(mdnApis)) {
        if (iface.indexOf('__') !== -1) continue;
        for (const api of Object.keys(mdnApis[iface])) {
          if (/[^a-z]/i.test(api) ||
              !(mdnApis[iface][api].__compat &&
                mdnApis[iface][api].__compat.support)) {
            continue;
          }
          promises.push(mdnDAO.put(CompatRow.create({
            id: `${iface}#${api}`,
          }).fromMdnData(mdnApis[iface][api], browserNameMap)));
        }
      }

      latests.mdn.version = dateID;
      latests.mdn.cls = compatRowSpec;
      return Promise.all(promises)
          .then(() => latestDAO.put(latests.mdn));
    })(),
  ]);
})().then(() => {
  //
  // Store latest versions locally.
  //
  let latestArray = [];
  for (const key of Object.keys(latests)) {
    latestArray.push(latests[key]);
  }
  fs.writeFileSync(
      `${__dirname}/../public/data/latest.json`,
      foam.json.Outputter.create({
        pretty: true,
        formatDatesAsNumbers: true,
        outputDefaultValues: false,
        useShortNames: false,
        strict: true,
      }).stringify(latestArray, mdn.Version));
}).then(() => {
  //
  // Issues update
  //
  if (!argv.updateIssues) return Promise.resolve();

  require('../public/lib/org/mozilla/mdn/IssueType.es6.js');
  require('../public/lib/org/mozilla/mdn/IssueStatus.es6.js');
  require('../public/lib/org/mozilla/mdn/Issue.es6.js');
  require('../public/lib/org/mozilla/mdn/VersionIssueGenerator.es6.js');

  return mdn.VersionIssueGenerator.create({
    clobberIssues: argv.clobberIssues,
  }).generateIssues(confluenceDAO, mdnDAO, issuesDAO);
}).then(() => logger.info('DONE'));
