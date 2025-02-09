#!/bin/sh

DATE="$(date +%Y-%m-%d-%H%M%S)"
mkdir -p ./archive/$DATE

cp ./site/sorbusdomestica.geojson ./archive/$DATE/sorbusdomestica.geojson       
cp ./tmp/bilder.json ./archive/$DATE/bilder.json
cp ./tmp/project.json ./archive/$DATE/project.json


