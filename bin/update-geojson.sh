#!/bin/sh

set -e

DATA=".."

CACHE="${DATA}/cache"
ADDONS="${DATA}/addons"

cd "$(dirname $0)/../."

pwd

#./bin/update-history.sh >> ./update-history/update-history.log

# ./bin/archive-stats.js ???????????????????????

#cp ./../../node/mediaIndex.json mediaIndex.json
curl https://speierling.arglos.ch/node/mediaIndex.json 2>/dev/null  > "${ADDONS}/mediaIndex.json"

./osm/bin/cat-osm-geojson.sh "../$CACHE" | \
            ./bin/check-tags.js | \
            ./bin/process-nominatim.js | \
            ./bin/add-media.js "${ADDONS}/mediaIndex.json" | \
            ./bin/process-project.js "${ADDONS}/project.json" 2> "${DATA}/log/project.log" | \
            ./bin/add-historic.js   | \
            ./bin/process-history.js   |  \
	    ./bin/add-growth.js > "${DATA}/sorbusdomestica.geojson"
              

#cat sorbusdomestica.geojson | ./bin/devel/reduce.js | ./bin/devel/flatten-tags.js > ./../../sorbusdomestica.geojson


echo "done"

