#!/bin/bash

set -e

# TODO(markdittmer): This is pretty silly, but confluence require()s include
# relative node_modules paths, so it's necessary for now.
if [ ! -d "${1}" ]; then
  >&2 echo "ERROR: Expected param 1 to be /local/path/to/foam2"
  exit 1
fi
if [ ! -d "${2}" ]; then
  >&2 echo "ERROR: Expected param 2 to be /local/path/to/confluence"
  exit 1
fi

WD=$(readlink -f $(dirname "$BASH_SOURCE"))
FD=$(readlink -f "${1}")
CD=$(readlink -f "${2}")

cd "${WD}/.."
npm install
cd node_modules
rm -rf foam2
ln -s "${FD}" foam2
rm -rf web-api-confluence-dashboard
ln -s "${CD}" web-api-confluence-dashboard

mkdir -p "${WD}/../data/confluence"
mkdir -p "${WD}/../data/mdn"
mkdir -p "${WD}/../data/issues"
