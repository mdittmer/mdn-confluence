#!/bin/bash

WD=$(readlink -f $(dirname "$BASH_SOURCE"))
cd "${WD}/.."

npm install -g firebase-tools
