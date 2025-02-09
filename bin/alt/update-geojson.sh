#!/bin/sh

cd "$(dirname $0)/../."

pwd

./bin/update-history.sh >> ./update-history/update-history.log

cat ./osm/sorbusdomestica.geojson | \
            ./bin/add-pics.js ./tmp/bilder.json | \
            ./bin/add-project.js ./tmp/project.json | \
	    ./bin/add-historic.js | \
            ./bin/add-history.js ./update-history/history.geojson | \
	     tee sorbusdomestica.geojson | \
            ./bin/beautify.js 2>beautify.log  > sorbusdomestica.geojson

cat sorbusdomestica.geojson | ./bin/reduce.js | ./bin/flatten-tags.js > ./../../sorbusdomestica.geojson


echo "done"

