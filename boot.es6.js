// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const fs = require('fs');
const process = require('process');

require('foam2');

require('./public/lib/org/mozilla/mdn/CompatJsonAdapter.es6.js');
require('./public/lib/org/mozilla/mdn/CompatJson.es6.js');
require('./public/lib/org/mozilla/mdn/CompatConfluenceJsonGenerator.es6.js');
global.mdn = org.mozilla.mdn;
