#!/bin/sh

set -e

if test -z "$1"; then
    echo "usage: cat-osm.sh <cachedir>"
    exit 1
else
    if ! test -d "$1"; then
	echo "error: cachedir not found"
	exit 1
    fi
fi
CACHE="$1"


cd $(dirname $0)/../.

pwd

geojson-merge ${CACHE}/sorbus*.json | \
    ./bin/update-nominatim.cjs ${CACHE}/nominatim.json | \
    ./bin/update-history.js ${CACHE}/history.json 

