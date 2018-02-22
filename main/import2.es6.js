// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('../boot.es6.js');

const argv = require('yargs')
      .help('h')
      .option('data-env', {
        alias: 'de',
        desc: `The environment where data should be imported to:One of ${
          mdn.DataEnv.VALUES.map(value => value.name)
        }`,
        coerce: de => {
          const value =
                mdn.DataEnv.VALUES.filter(value => value.name === de)[0];
          if (!value) throw new Error(`Unknown data-env: ${de}`);
          return value;
        },
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

(async function() {
  foam.__context__ = foam.__context__.createSubContext({
    dataEnv: argv.dataEnv,
  });

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
  mdn.VersionIssueGenerator.create({
    clobberIssues: argv.clobberIssues,
  }).generateIssues(
      await initDAO(confluenceSink),
      await initDAO(compatSink),
      com.google.firebase.FirestoreDAO.create({
        collectionPath: 'issues',
        of: mdn.Issue,
      }));}
)();
