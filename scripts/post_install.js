// Copyright 2018. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const path = require('path');
const process = require('process');
const { spawn } = require('child_process');

const scriptDir = __dirname;
const sourceRoot = path.join(scriptDir, '..');

const isWinPlatform = (process.platform === "win32");

function runCommand(cmd, ...args) {

  try {

    let spawnedChild;
    const cmdWithArgs = cmd + ' ' + args.join(' ');
    console.log('Executing command:', cmdWithArgs);

    if (isWinPlatform) {

      spawnedChild = spawn('cmd.exe', ['/c', cmdWithArgs]);

    } else {

      spawnedChild = spawn(cmdWithArgs, { shell: true });

    }

    if (spawnedChild) {

      spawnedChild.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      spawnedChild.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      spawnedChild.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
      });

    }

  } catch (err) {

    console.error(err);

  }

}

// Run the commands.
if (isWinPlatform) {

  runCommand('mkdir', path.join('data', 'browser-compat-data'));

} else {

  runCommand('mkdir', '-p', path.join('data', 'browser-compat-data'));

}
