// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

//
// Path constants
//

const BASE_DIR = path.resolve(__dirname, '..');
const MY_NODE_MODULES = path.resolve(BASE_DIR, 'node_modules');
const EMBEDDED_NODE_MODULES =
        path.resolve(BASE_DIR, '..', '..', 'node_modules');
let NM;
if (fs.existsSync(MY_NODE_MODULES)) {
  NM = MY_NODE_MODULES;
} else if (fs.existsSync(EMBEDDED_NODE_MODULES)) {
  NM = EMBEDDED_NODE_MODULES;
} else {
  throw new Error(`mdn-confluence build: Unable to find node_modules`);
}
const NODE_MODULES = NM;
const SEP = path.sep;

//
// Implement mkdir -p
//

const mkPath = (base, parts) => {
  if (!fs.existsSync(base))
    throw new Error(`mkPath: Base path must exist`);

  let combinedPath;
  for (let i = 1; i <= parts.length; i++) {
    const pathParts = [base].concat(parts.slice(0, i));
    combinedPath = path.resolve.apply(path, pathParts);
    if (!fs.existsSync(combinedPath)) {
      fs.mkdirSync(path);
    }
  }

  return combinedPath;
};

// Run FOAM2 build tool
cp.execSync(`node ${NODE_MODULES}${SEP}foam2${SEP}tools${SEP}build.js web,firebase`,
            {cwd: BASE_DIR});

// Copy FOAM2 JavaScript binary
const foam2 = mkPath(BASE_DIR, ['public', 'third_party', 'foam2']);
fs.copyFileSync(path.resolve(NODE_MODULES, 'foam2', 'foam-bin.js'),
                path.resolve(foam2, 'foam-bin.js'));

// Copy targeted FOAM models from Confulence
const confluence = mkPath(BASE_DIR, ['public', 'third_party', 'confluence']);
fs.copyFileSync(path.resolve(NODE_MODULES, 'web-api-confluence-dashboard',
                             'lib', 'web_apis', 'release.es6.js'),
                path.resolve(confluence, 'release.es6.js'));
fs.copyFileSync(path.resolve(NODE_MODULES, 'web-api-confluence-dashboard',
                             'lib', 'grid_dao.es6.js'),
                path.resolve(confluence, 'grid_dao.es6.js'));
