#!/bin/sh

set -e

DATA="../"

CACHE="${DATA}/cache"
ADDONS="${DATA}/addons"
HGT="${DATA}/hgt/data1"
NODE="${DATA}/node"

cd "$(dirname $0)/../."

pwd

#./bin/update-history.sh >> ./update-history/update-history.log

# ./bin/archive-stats.js ???????????????????????

#cp ./../../node/mediaIndex.json mediaIndex.json
curl https://speierling.arglos.ch/node/mediaIndex.json 2>/dev/null  > "${ADDONS}/mediaIndex.json"

./osm/bin/cat-osm-geojson.sh "../$CACHE" | \
            ./bin/check-tags.js | \
            ./bin/process-elevation.js | \
	    ./hgt/make-node-dems.mjs "${HGT}" "${NODE}" | \
	    ./hgt/update-slope-addon.mjs "${HGT}" "${ADDONS}/slope.json" | \
	    ./bin/add-slope.js "${ADDONS}/slope.json" | \
            ./bin/process-nominatim.js > tmp.geojson
cat tmp.geojson | \
            ./bin/add-media.js "${ADDONS}/mediaIndex.json" | \
            ./bin/process-project.js "${ADDONS}/project.json" 2> "${DATA}/log/project.log" | \
            ./bin/add-historic.js   | \
            ./bin/process-history.js   |  \
	    ./bin/add-growth.js > "${DATA}/sorbusdomestica.geojson"
test -f tmp.geojson && rm tmp.geojson              

#cat sorbusdomestica.geojson | ./bin/devel/reduce.js | ./bin/devel/flatten-tags.js > ./../../sorbusdomestica.geojson


echo "done"

