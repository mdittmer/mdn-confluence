// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const process = require('process');

const argv = require('yargs')
      .help('help').alias('help', 'h')
      .option('data-env', {
        alias: 'de',
        desc: `The environment where data should be imported to. See org.mozilla.mdn.DataEnv for details`,
        default: 'DEV',
      })
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

process.env.DATA_ENV = argv.dataEnv;
require('../boot.es6.js');
mdn.InfraServerContextProvider.create().install();

(async function() {
  const confluenceSink =
        await mdn.ConfluenceImporter.create({
          releaseJsonUrl: argv.confluenceReleaseUrl,
          gridRowsJsonUrl: argv.confluenceDataUrl,
        }).importClassAndData();
  const compatSink =
        await mdn.CompatImporter.create().importClassAndData();

  if (!argv.updateIssues) return;

  const initDAO = function(sink) {
    const dao = foam.dao.MDAO.create({of: sink.of});
    return Promise.all(sink.array.map(item => dao.put(item))).then(() => dao);
  };
  const confluenceDAO = await initDAO(confluenceSink);
  const compatDAO = await initDAO(compatSink);
  await mdn.IssuesImporter.create({
    confluenceDAO,
    compatDAO,
  }).importClassAndData();
}
)();
