all: dems addon


dems:
	cat ../../../data/sorbusdomestica.geojson | ./make-node-dems.mjs ../../../data/hgt/data1/ ../../../data/node/  > /dev/null 


forcedems:
	cat ../../../data/sorbusdomestica.geojson | ./make-node-dems.mjs ../../../data/hgt/data1/ ../../../data/node/ true  


addon:
	test -f ../../../data/addons/slope.json || echo "{}" > ../../../data/addons/slope.json 
	cat ../../../data/sorbusdomestica.geojson | ./update-slope-addon.mjs ../../../data/hgt/data1/ ../../../data/addons/slope.json >/dev/null

