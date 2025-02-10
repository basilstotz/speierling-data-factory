.PHONY: all
all: sorbusdomestica.geojson

.PHONY: sorbusdomestica.geojson
sorbusdomestica.geojson:
	find .. -name "Tabelle-*"|sort|tail -n1|xargs csv2json > ../addons/project.json 
	./bin/update-geojson.sh


.PHONY: archive
archive:
	test -d archive || mkdir -p archive
	./bin/archive.sh	

