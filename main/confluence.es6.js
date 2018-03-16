// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const argv = require('yargs')
      .help('help').alias('help', 'h')
      .option('query', {
        alias: 'q',
        desc: `Search query`,
        default: '',
      })
      .option('browsers', {
        alias: 'b',
        desc: `Comma-separated list of browser descriptions`,
        default: '',
      })
      .argv;

process.env.DATA_ENV = 'DEV';
require('../boot.es6.js');
require('../public/lib/org/mozilla/mdn/mlang/Expressions.es6.js');
require('../public/lib/org/mozilla/mdn/parse/ConfluenceQueryInterpreter.es6.js');
require('../public/lib/org/mozilla/mdn/parse/DefaultConfluenceQueryInterpreter.es6.js');
require('../public/lib/org/mozilla/mdn/parse/ReleaseApiConfluenceQueryInterpreter.es6.js');
require('../public/lib/org/mozilla/mdn/parse/ConfluenceQueryParser.es6.js');
mdn.InfraServerContextProvider.create().install();

const searchKey = argv.query;
const browsers = argv.browsers;

(async function() {
  //
  // Get releases that match --browsers
  //
  const allReleases = await mdn.BaseImporter.create().getReleases_();
  let releases;
  if (browsers) {
    releases = [];

    const confluenceSink =
            await mdn.ConfluenceImporter.create({
              releaseJsonUrl: argv.confluenceReleaseUrl,
              gridRowsJsonUrl: argv.confluenceDataUrl,
            }).importClassAndData();
    const ConfluenceRow = confluenceSink.of;
    const browserProperties = ConfluenceRow.getAxiomsByClass(mdn.GridProperty);

    // Leverage ConfluenceQueryParser [browser-desc]:[boolean] matching to
    // extract matching browsers for [browser-desc].
    const ctx = foam.createSubContext({
      selected: browserProperties,
      selectable: browserProperties,
    });
    const parser = mdn.parse.ConfluenceQueryParser.create({
      of: ConfluenceRow,
      interpreter: mdn.parse.ReleaseApiConfluenceQueryInterpreter
          .create(null, ctx)
    }, ctx);
    const eachBrowser = browsers.split(',');
    for (const browser of eachBrowser) {
      const str = `${browser}:true`;
      const parse = parser.parseString(str);
      foam.assert(foam.mlang.predicate.And.isInstance(parse),
                  `Expected top-level parse tree node: AND(...)`);
      for (const eq of parse.args) {
        foam.assert(foam.mlang.predicate.Eq.isInstance(eq),
                    `Expected intermediate parse tree node: EQ(...)`);
        foam.assert(mdn.GridProperty.isInstance(eq.arg1),
                    `Expected EQ left side: GridProperty`);
        const prop = eq.arg1;
        foam.assert(!!prop.release, `Expected GridProperty to have release`);
        releases.push(prop.release);
      }
    }
  } else {
    releases = allReleases.slice(-10);
  }

  foam.CLASS({
    package: 'org.mozilla.mdn',
    name: 'ConfluenceCatalogState',

    properties: [
      {
        class: 'String',
        name: 'searchKey',
      },
      {
        class: 'Array',
        of: 'String',
        name: 'releaseKeys',
      },
    ],
  });

  const stateObj = mdn.ConfluenceCatalogState.create({
    searchKey,
    releaseKeys: releases.map(release => release.releaseKey),
  });
  const urlState = foam.web.DetachedURLState.create();
  urlState.setPath('!/catalog');
  stateObj.cls_.getAxiomsByClass(foam.core.Property)
      .map(prop => urlState.addBinding(prop.name, stateObj[prop.name + '$']));

  console.log(' :: ');
  console.log(' :: ');
  console.log(' :: Confluence URL');
  console.log(' :: ');
  console.log(`https://web-confluence.appspot.com/${urlState.getHash()}`);
  console.log(' :: ');
  console.log(' :: ');
})();
