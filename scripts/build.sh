#!/bin/bash

set -evh

REL_WD=$(dirname "$BASH_SOURCE")
pushd ${REL_WD} > /dev/null
WD=$(pwd)
popd > /dev/null

cd "${WD}/.."

node node_modules/foam2/tools/build.js web,firebase

mkdir -p public/third_party/foam2
cp \
  node_modules/foam2/foam-bin.js \
  public/third_party/foam2

mkdir -p public/third_party/confluence
cp \
  node_modules/web-api-confluence-dashboard/lib/web_apis/release.es6.js \
  node_modules/web-api-confluence-dashboard/lib/grid_dao.es6.js \
  public/third_party/confluence
