
schweiz:
	rm cache/sorbus+045+005.json
	rm cache/sorbus+050+005.json
	./bin/query-all-sorbus.sh
	./bin/update-geojson.sh
#	./bin/upload.sh

active:
	find ./cache/ -name "sorbus*" -size +100c -exec rm \{\} \;
	./bin/query-all-sorbus.sh
	./bin/update-geojson.sh
#	./bin/upload.sh

all:
	rm ./cache/sorbus*
	./bin/query-all-sorbus.sh
	./bin/update-geojson.sh
#	./bin/upload.sh

update:
	./bin/update-geojson.sh

prereqs:
	./bin/prereqs.sh

