#!/usr/bin/env node


function structuredClone(x){
    return JSON.parse(JSON.stringify(x))
}

function updateTags(originalFeature){

    
    // to be removed? done in beautify.js?
    const filter = [
	"elevation",
        "nominatim",
        "user",
	"speierlingproject:line"
    ];


    let outFeature = structuredClone(originalFeature);
    
    //save addr for later

    let beautify=outFeature.properties.beautify;
    let tags=outFeature.properties.tags;

    let changed = [];
    let remove = [];


    // geofilter to restrict usage on place

    // save addr: tags to addr
    let addr={};
    for (const [key, value] of Object.entries(tags)) {
	if(key.startsWith("addr:"))addr[key] = value;
    }


    // remove addr: tags i and in filter in update
    for(let j=0;j<beautify.update.length;j++){
	let key=beautify.update[j];
	if(filter.includes(key)||key.startsWith("addr:")){
	    remove.push(key);
	}else{
	    changed.push(key)
	}
    }
    // remove addr: tags in create
    for(let j=0;j<beautify.create.length;j++){
	let key=beautify.create[j];
	if(filter.includes(key)||key.startsWith("addr:")){
	    remove.push(key);
	}else{
	    changed.push(key)
	}
    }

    function geoFilter(addr, key, value){
      return (addr[key]&&addr[key]==value)
    }

    // to be removed
    let geoF=geoFilter(addr,"addr:town","Münchenstein");

    if(changed.length>0 && tags.propagation && geoF){

	//delete tags we dont want to update
	for(let k=0;k<remove.length;k++){
	    let key=remove[k];
	    delete tags[key];
	}

	// delete tags which did not change
	for (const [key, value] of Object.entries(tags)) {
	    if(!changed.includes(key)){delete tags[key]}	
	}
	
	//add keys to delete, this is only done when thre are other updates (to minimize changesets)

	for(let j=0;j<beautify.remove.length;j++)tags[key]="🗑️'";

	if(outFeature.properties.project){delete outFeature.properties.project}
	if(outFeature.properties.beautify){delete outFeature.properties.beautify}
	if(outFeature.properties.location){delete outFeature.properties.location}
	if(outFeature.properties.nominatim){delete outFeature.properties.nominatim}
	if(outFeature.properties.relations){delete outFeature.properties.relations}
	//if(outFeature.properties.meta){delete outFeature.properties.meta}
	if(outFeature.properties.pictures_url_prefix){delete outFeature.properties.pictures_url_prefix}
	if(outFeature.properties.pictures){delete outFeature.properties.pictures}

	//if(outFeature.geometry.coordinates[2]){delete outFeature.geometry.coordinates[2]}

	return outFeature;
    }
    
    return false;
}



function processGeojson(geoIn){

    var geoOut={ type: "FeatureCollection", features: [] };
    
    for(let i=0;i<geoIn.features.length;i++){
	let outFeature = updateTags(geoIn.features[i]);
	if(outFeature)geoOut.features.push(outFeature);
    }
    
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
