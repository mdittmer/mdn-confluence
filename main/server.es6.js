// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const argv = require('yargs')
      .help('help').alias('help', 'h')
      .option('data-env', {
        alias: 'de',
        desc: `The environment where data should be imported to. See org.mozilla.mdn.DataEnv for details.`,
        default: 'DEV',
      })
      .argv;

// Set environment variable for child process configuration.
require('process').env.DATA_ENV = argv.dataEnv;
require('../boot.es6.js');
mdn.WebServerContextProvider.create().install();

mdn.WebSocketServer.create().start();
