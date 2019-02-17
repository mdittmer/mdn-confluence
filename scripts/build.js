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

// Run FOAM2 build tool
cp.execSync(`node ${NODE_MODULES}${SEP}foam2${SEP}tools${SEP}build.js web,firebase`,
            {cwd: BASE_DIR});
