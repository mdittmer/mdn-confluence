#!/bin/bash

set -evh

REL_WD=$(dirname "$BASH_SOURCE")
pushd ${REL_WD} > /dev/null
WD=$(pwd)
popd > /dev/null

cd "${WD}/.."

if [ -d "./node_modules" ]; then
  NODE_MODULES="./node_modules"
elif [ -d "../../node_modules" ]; then
  NODE_MODULES="../../node_modules"
else
  >&2 echo "mdn-confluence build error: Failed to locate node_modules"
  exit 1
fi

node "${NODE_MODULES}/foam2/tools/build.js" web,firebase

mkdir -p public/third_party/foam2
cp \
  "${NODE_MODULES}/foam2/foam-bin.js" \
  public/third_party/foam2

mkdir -p public/third_party/confluence
cp \
  "${NODE_MODULES}/web-api-confluence-dashboard/lib/web_apis/release.es6.js" \
  "${NODE_MODULES}/web-api-confluence-dashboard/lib/grid_dao.es6.js" \
  public/third_party/confluence
