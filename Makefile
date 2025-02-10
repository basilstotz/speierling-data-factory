.PHONY: all
all: sorbusdomestica.geojson

sorbusdomestica.geojson: ../addons/project.json  # osm/sorbusdomestica.geojson  bilder 
	./bin/update-geojson.sh


../addons/project.json: ../projekt.csv
	csv2json -d ../projekt.csv ../addons/project.json 


#tmp/bilder.json: node  
#	./bin/make-bilder.sh ./../map/node  | ./bin/make-media.js ./../map/node > ./tmp/bilder.json


#osm/sorbusdomestica.geojson:
#	$(MAKE) -C ./osm update



#.PHONY: bilder
#bilder:
#	@test -d ./../../Gemeinden || (echo "./../../Gemeinden not found";false)
#	./bin/convert-all.sh ./../../Gemeinden ./../../node
#	./bin/make-bilder.js ./../../node/


.PHONY: archive
archive:
	test -d archive || mkdir -p archive
	./bin/archive.sh	

