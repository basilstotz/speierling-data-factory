#!/bin/sh

set -e

cd $(dirname $0)/../.

pwd

geojson-merge ./cache/sorbus*.json | \
    ./bin/update-nominatim.cjs cache/nominatim.json | \
    ./bin/update-history.js cache/history.json  > sorbusdomestica.geojson.tmp
mv sorbusdomestica.geojson.tmp sorbusdomestica.geojson
