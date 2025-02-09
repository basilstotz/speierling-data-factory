#!/usr/bin/env node

function reduce(feature){

    let filter=[
	"species",
	"start_date",
	"circumference",
	"height",
	"crown_diameter",
	"propagation",
	"propagation:parent",
	"media"
    ];
  
    first=true;
    if(feature.properties.tags){
	for (var [key, value] of Object.entries(feature.properties.tags)) {
	    if(filter.includes(key)||key.startsWith('addr:')||key.startsWith('speierlingproject:')){
		if(!((key=='addr:full')||(key=='speierlingproject:line'))){
		    if(key.startsWith('addr:')&&first){
			key="addr:town";
			first=false;
		    }
		    if(key=="species")value="sorbus domestica";
		    key=key.replace(/speierlingproject:/,"projekt:");
		    //key=key.replace(/:/g,"_");
		    feature.properties[key]=value;
		}
	    }
	}
        delete feature.properties.tags;
    }
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
