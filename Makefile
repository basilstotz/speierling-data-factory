.PHONY: all
all: sorbusdomestica.geojson

sorbusdomestica.geojson: osm/sorbusdomestica.geojson tmp/project.json   #bilder 
	./bin/update-geojson.sh

#tmp/bilder.json: node  
#	./bin/make-bilder.sh ./../map/node  | ./bin/make-media.js ./../map/node > ./tmp/bilder.json

tmp/project.json: projekt.csv
	test -d ./tmp || mkdir -p ./tmp
	csv2json -d ./projekt.csv ./tmp/project.json 

osm/sorbusdomestica.geojson:
	$(MAKE) -C ./osm update



.PHONY: bilder
bilder:
	@test -d ./../../Gemeinden || (echo "./../../Gemeinden not found";false)
	./bin/convert-all.sh ./../../Gemeinden ./../../node
	./bin/make-bilder.js ./../../node/


.PHONY: archive
archive:
	test -d archive || mkdir -p archive
	./bin/archive.sh	

