#!/bin/sh

DIRNAME=$(dirname $0);
PARENT=$(basename $DIRNAME)


cd "$(pwd)/../../."

pwd

exit

cat <<EOF > Makefile
.PHONY: schweiz
schweiz:
	$(MAKE) -C ${PARENT}/osm schweiz
	$(MAKE) -C ${PARENT}/media media
	$(MAKE) -C ${PARENT} all
	$(MAKE) -C ../gis all

.PHONY: active
active:
	$(MAKE) -C ${PARENT}/osm active
	$(MAKE) -C ${PARENT}/media media
	$(MAKE) -C ${PARENT} all
	$(MAKE) -C ../gis all

.PHONY: all
all:
	$(MAKE) -C ${PARENT}/osm all
	$(MAKE) -C ${PARENT}/media media
	$(MAKE) -C ${PARENT} all
	$(MAKE) -C ../gis all
EOF

test -d "archive" || mkdir -p "archive"
test -d "log" || mkdir -p "log"
test -d "cache" || mkdir -p "cache"
test -d "addons" || mkdir -p "addons"

