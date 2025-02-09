#!/usr/bin/env node

function reduce(feature){
    if(feature.properties.project){delete feature.properties.project}
    if(feature.properties.beautify){delete feature.properties.beautify}
    if(feature.properties.location){delete feature.properties.location}
    if(feature.properties.nominatim){delete feature.properties.nominatim}
    if(feature.properties.relations){delete feature.properties.relations}
    if(feature.properties.meta){delete feature.properties.meta}
    if(feature.properties.pictures_url_prefix){delete feature.properties.pictures_url_prefix}
    if(feature.properties.pictures){delete feature.properties.pictures}
    return feature
}

function processGeojson(geoIn){

    var geoOut={ type: "FeatureCollection", features: [] };

    geoIn.features.forEach(
	(feature) => { geoOut.features.push(reduce(feature)) }
    );

    process.stdout.write(JSON.stringify(geoOut,null,2)+'\n');	    
}

var chunks = '';

process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});

process.stdin.on('end', () => {
    processGeojson(JSON.parse(chunks))
});


/*
const fs = require('fs');
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}

const { execSync } = require('child_process');
function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
*/
