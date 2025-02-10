
schweiz:
#	rm cache/sorbus+045+005.json
	rm cache/sorbus+050+005.json
	./bin/query-all-sorbus.sh ../../cache

active:
	find ./cache/ -name "sorbus*" -size +100c -exec rm \{\} \;
	./bin/query-all-sorbus.sh ../../cache

all:
	rm ./cache/sorbus*
	./bin/query-all-sorbus.sh ../../cache

prereqs:
	./bin/prereqs.sh

