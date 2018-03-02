// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

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
      .option('output-dir', {
        alias: 'od',
        desc: `Directory where modified browser-compat-data JSON files will be stored`,
        default: path.resolve(`${__dirname}/../data/browser-compat-data`),
        coerce: od => {
          if (!fs.existsSync(od)) {
            throw new Error(`Output directory "${od}" does not exist`);
          }
          return path.resolve(od);
        },
      })
      .argv;

process.env.DATA_ENV = 'DEV';
require('../boot.es6.js');
mdn.InfraServerContextProvider.create().install();

(async function() {
  const confluenceSink =
        await mdn.ConfluenceImporter.create({
          releaseJsonUrl: argv.confluenceReleaseUrl,
          gridRowsJsonUrl: argv.confluenceDataUrl,
        }).importClassAndData();

  const confluenceDAO = foam.dao.MDAO.create({of: confluenceSink.of});
  await Promise.all(confluenceSink.array.map(item => confluenceDAO.put(item)));
  const jsonDAO = foam.dao.MDAO.create({of: mdn.CompatJson});
  await mdn.CompatJsonGenerator.create({
    outputDir: argv.outputDir,
  }).generateJson(confluenceDAO, jsonDAO);
}
)();
