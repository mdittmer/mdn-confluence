// Copyright 2018. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const path = require('path');
const process = require('process');
const { spawn } = require('child_process');

//
// Path constants.
//

const SCRIPT_DIR = __dirname;
const SOURCE_ROOT = path.join(SCRIPT_DIR, '..');

//
// Platform vars.
//

const isWinPlatform = ('win32' === process.platform);

/**
 * Executes any arbitrary shell commands.
 * 
 * @param {string} cmd The command to execute. 
 * @param {...string} arg Optional arguments for the provided command. 
 */
function runCommand(cmd, ...args) {

  try {

    let spawnedChild;
    const cmdWithArgs = cmd + ' ' + args.join(' ');

    console.log('Executing command:', cmdWithArgs);

    // Execute the provided command in a win32 env.
    if (isWinPlatform) {

      // Spawn a child.
      spawnedChild = spawn('cmd.exe', ['/c', cmdWithArgs]);

    } else {  // Execute the provided command in a env. other than win32.

      // Spawn a child.
      spawnedChild = spawn(cmdWithArgs, { shell: true });

    }

    if (spawnedChild) {

      // Log the stdin stream.
      spawnedChild.stdout.on('data', (data) => {

        console.log(data.toString());

      });

      // Log the stderr stream.
      spawnedChild.stderr.on('data', (data) => {

        console.error(data.toString());

      });

      // Log the exit status.
      spawnedChild.on('exit', (code) => {

        console.log(`Child exited with code ${code}`);

      });

    }

  } catch (err) {

    // log the error.
    console.error(err);

  }

}

// Create the 'data/browser-compat-data' dir.
if (isWinPlatform) {

  // win32.
  runCommand('mkdir', path.join('data', 'browser-compat-data'));

} else {

  // darwin or linux.
  runCommand('mkdir', '-p', path.join('data', 'browser-compat-data'));

}
