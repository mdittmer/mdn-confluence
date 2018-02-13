#!/bin/bash

WD=$(readlink -f $(dirname "$BASH_SOURCE"))
cd "${WD}/.."

node node_modules/foam2/tools/build.js web

mkdir -p public/third_party/foam2
cp \
  node_modules/foam2/foam-bin.js \
  public/third_party/foam2

mkdir -p public/third_party/confluence
cp \
  node_modules/web-api-confluence-dashboard/lib/web_apis/release.es6.js \
  node_modules/web-api-confluence-dashboard/lib/grid_dao.es6.js \
  public/third_party/confluence

node \
  main/import.es6.js \
  https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.Release.json \
  https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.GridRow.json
