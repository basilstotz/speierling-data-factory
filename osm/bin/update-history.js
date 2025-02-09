#!/usr/bin/env node

//const fs = require('fs');

import fs from 'node:fs'
import * as OSM from 'osm-api'


function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}

function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}


function clone(x){
    return JSON.parse(JSON.stringify(x))
}

function stderr(text){
    process.stderr.write(text+"\n")
}


function getCachedHistory(path){
    let history;
    try {
	const stats = fs.statSync(path);
	history = JSON.parse(read(path));
    } catch (err) {
	history = makeFeatureCollection();
    }
    return history
}

function writeCachedHistory(path,history){
    write(path, JSON.stringify(history,null,2)+"\n");    
}

async function updateHistory(history,geo){

    //let indexedHistory = new IndexedFeatureCollection(history);

    let geoFeatures=geo.features;
    
    for(let i=0;i<geoFeatures.length;i++){

	let geoFeature = geoFeatures[i];
	
	let geoNodeId = geoFeature.id;
	let geoId = geoFeature.properties.id;
        let geoVersion= geoFeature.properties.meta.version;

	let historyFeature=history[geoNodeId];

	//let isCached = false;
	let needsUpdate = false;
	if(historyFeature){
	    //isCached=true;
	    //console.log(geoNodeId+" is cached");
	    let historyVersion = historyFeature.length;

	    if(geoVersion>historyVersion){
		if(geoVersion==historyVersion+1){
		    console.log(geoNodeId+" could be updated from file");
		    needsUpdate=true;
		}else{
		    needsUpdate=true;
		}
		console.log("cache for "+geoNodeId+" is outdated");
		//console.log(JSON.stringify(geoFeatures[i],null,2)+"\n\n");
		//console.log(JSON.stringify(historyFeature,null,2)+"\n\n");
		//process.exit();
		needsUpdate=true;
	    }
	}else{
	    needsUpdate=true
	}
	if(needsUpdate){
	    console.log("get "+geoNodeId+"from osm");
	    let hist = await OSM.getFeatureHistory("node",geoId);
	    history[geoNodeId]=hist;
 	}
    }
    return history;
    
}

async function processGeo(geo){

    let historyIn = getCachedHistory(historyPath);
    let history = await updateHistory(historyIn,geo);
    geo.features.forEach( (feature) => {
	let id=feature.id;
	feature.properties['fullhistory']=history[id];
    })
    writeCachedHistory(historyPath,history)
    process.stdout.write(JSON.stringify(geo,null,2));
}



let historyPath=process.argv[2];
if(!historyPath){
    process.stderr.write('usage: update-history.js <historycache>\n');
    process.exit(1);
}


var chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    let geo=JSON.parse(chunks);
    processGeo(geo);
});


