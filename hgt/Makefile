all: nodedems addon



nodedems:
	cat ../../sorbusdomestica.geojson | ./make-node-dems.mjs ../../hgt/data1/ ../../node/ 


addon:
	test -f ../../addons/slope.json || echo "{}" > ../../addons/slope.json 
	cat ../../sorbusdomestica.geojson | ./update-slope-addon.mjs ../../hgt/data1/ ../../addons/slope.json
