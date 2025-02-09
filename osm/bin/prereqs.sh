#!/bin/sh

if test -z "$(which query-overpass)"; then
    npm install -g query-overpass
    npm install -g @mapbox/geojson-merge
fi




