#!/bin/sh

scp sorbusdomestica.geojson www.amxa.ch:public_html/arglos/speierling/data/osm/.
ssh www.amxa.ch public_html/arglos/speierling/data/bin/update-geojson.sh
