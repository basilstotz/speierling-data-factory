.PHONY: all
all: sorbusdomestica.geojson

.PHONY: sorbusdomestica.geojson
sorbusdomestica.geojson:
	test -f ../addons/slope.json || echo "{}" > ../addons/slope.json
	find ../csv -name "Tabelle-*"|sort|tail -n1|xargs csv2json > ../addons/project.json 
	./bin/update-geojson.sh

init: ../Makefile
	./bin/init.sh

.PHONY: archive
archive:
	test -d archive || mkdir -p archive
	./bin/archive.sh	

