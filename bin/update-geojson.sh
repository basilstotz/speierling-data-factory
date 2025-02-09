#!/bin/sh

cd "$(dirname $0)/../."

pwd

./bin/update-history.sh >> ./update-history/update-history.log

#cp ./../../node/mediaIndex.json mediaIndex.json
curl https://speierling.arglos.ch/node/mediaIndex.json 2>/dev/null  >mediaIndex.json

cat ./osm/sorbusdomestica.geojson | \
            ./bin/check-tags.js | \
            ./bin/process-nominatim.js | \
            ./bin/add-media.js mediaIndex.json | \
            ./bin/process-project.js ./tmp/project.json 2> project.log | \
            ./bin/add-historic.js   | \
            ./bin/process-history.js ./update-history/history.geojson  |  \
	    ./bin/add-growth.js > sorbusdomestica.geojson
              

cat sorbusdomestica.geojson | ./bin/devel/reduce.js | ./bin/devel/flatten-tags.js > ./../../sorbusdomestica.geojson


echo "done"

