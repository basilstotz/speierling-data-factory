
all:
	@./bin/query-all-sorbus.sh

schweiz:
	@rm cache/sorbus+045+005.json
	@./bin/query-all-sorbus.sh


sorbusdomestica.geojson: 
	geojson-merge ./cache/sorbus*.json | node ./bin/update-meta.js > sorbusdomestica.geojson.tmp                                                       
	mv sorbusdomestica.geojson.tmp sorbusdomestica.geojson


prereqs:
	@./bin/prereqs.sh

