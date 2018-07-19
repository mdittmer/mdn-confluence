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
 * Executes any arbitrary shell commands in a synchronous manner and 
 * pipes the stdin and stderr of the running command to the main process.
 * 
 * @param {string} cmd The command to execute. 
 * @param {...string} arg Optional arguments for the provided command. 
 */
function runCommandThenExit(cmd, ...args) {

  try {

    let spawnedChild;
    const cmdWithArgs = cmd + ' ' + args.join(' ');

    console.log('[post_install]: Executing command:', cmdWithArgs);

    // Execute the provided command in a win32 env.
    if (isWinPlatform) {

      // Spawn a child.
      spawnedChild = spawn('cmd.exe', ['/c', cmdWithArgs]);

    } else {  // Execute the provided command in a env. other than win32.

      // Spawn a child.
      spawnedChild = spawn(cmdWithArgs, { shell: true });

    }

    if (spawnedChild) {

      // Pipe the stdin stream.
      spawnedChild.stdout.pipe(process.stdout);

      // Pipe the stderr stream.
      spawnedChild.stderr.pipe(process.stderr);

      // Log the exit status.
      spawnedChild.on('exit', (code) => {

        console.log(`[post_install]: Child exited with code ${code}`);

        // Terminate the process, with the same exit code as of child.
        process.exit(code);

      });

    }

  } catch (err) {

    // log the error.
    console.error('[post_install]' + err);

    // Terminate the process with errorCode = 1.
    process.exit(1);

  }

}

// Create the 'data/browser-compat-data' dir.
if (isWinPlatform) {

  // win32.
  runCommandThenExit('mkdir', path.join('data', 'browser-compat-data'));

} else {

  // darwin or linux.
  runCommandThenExit('mkdir', '-p', path.join('data', 'browser-compat-data'));

}
