#!/bin/bash

REL_WD=$(dirname "$BASH_SOURCE")
pushd ${REL_WD} > /dev/null
WD=$(pwd)
popd > /dev/null

cd "${WD}/.."

npm install -g firebase-tools
