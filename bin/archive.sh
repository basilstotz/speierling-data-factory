#!/bin/sh

pwd
DATE="$(date +%Y-%m-%d-%H%M%S)"
mkdir -p ../archive/$DATE

cp ../sorbusdomestica.geojson ../archive/$DATE/sorbusdomestica.geojson       
cp ../addons/mediaIndex.json ../archive/$DATE/mediaIndex.json
cp ../addons/project.json ../archive/$DATE/project.json


