#!/usr/bin/env node

//const fs = require('fs');

import fs from 'node:fs'
import * as OSM from 'osm-api'

//import fetch from 'node-fetch'

//const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/*
fetch("https://speierling.arglos.ch")
    .then((response) => response.text())
    .then((data) => { console.log(data) })

*/



//    .then( (resp) => { console.log(JSON.stringify(arg,null,2)) }).catch( (e)=> {console.log(e)});

    






function year(dateString){
    let date = new Date(dateString);
    let zeit=date.getFullYear()+(1.0/12.0)*date.getMonth()+(1.0/365.0)*date.getDate();
    return Math.round(zeit*1000)/1000.0
}


function diffHistory(history){

    let id=history[0].id;
    
    //fill all oldValues
    let diffs=[];				  
    let oldValues={};
    for(let i=0;i<history.length;i++){
	let tags=history[i].tags;
	Object.entries(tags).forEach( ([key,value]) => {
	    oldValues[key]="";
	});
    }
    
    //get diffs
    for(let i=0;i<history.length;i++){
	
	let tags=history[i].tags;
        let timestamp=history[i].timestamp
	let version=history[i].version;
	
	
	let diffValues={};
	diffValues["timestamp"]=timestamp;
	diffValues["version"]=version;
	// tag loop
	let changed=false;
	Object.entries(tags).forEach( ([key,newVal]) => {
	    if(newVal!=oldValues[key]){
		changed=true;
		oldValues[key]=newVal;
		diffValues[key]=newVal;
	    }
	})
	if(changed){
	    //line[timestamp]=diffValues
	    diffs.push(diffValues)
	}
    }
    return diffs;
}

function getChanges(distory,key){
    let out=[];
    for(let i=1;i<distory.length;i++){

	let line={};
	let dasda=distory[i];
	if(dasda[key]){
	    line["timestamp"]=dasda["timestamp"];
	    line[key]=dasda[key];
	    out.push(line)
	}
    }
    return out;
}


//OSM.getFeatureHistory("node",10261113000).then( (arg) => { console.log(arg) }).catch( (e)=> {console.log(e)});


/*
function getHistory(id){
    OSM.getFeatureHistory("node",id)
	.then( (arg) => { History[arg.id]=arg })
	.catch( (e)=> {console.log(e)});

}
*/

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



// geojson tools

// class FeatureCollection
function makeFeatureCollection(features = []){
    return { type: "FeatureCollection", features: features }
}


function pushFeature(featureCollection,feature){
    featureCollection.features.push(feature);
}

function replaceFeature(featureCollection,feature){
    let indexed= new IndexedFeatureCollection(featureCollection);
    let featureIndex=indexed.getFeatureIndex(feature.id)
    if(featureIndex){
	featureCollection.features[featureIndex]=feature
    }
}

function updateFeature(featureCollection,feature){
    let indexed= new IndexedFeatureCollection(featureCollection);
    let featureIndex=indexed.getFeatureIndex(feature.id)
    if(featureIndex){
	featureCollection.features[featureIndex]=feature
    }else{
	featureCollection.features.push(feature);
    }
}
    

// class

function makeFeature(id,properties={}){
    return { type: "Feature", id: "node/"+id, properties: properties }
}

/*
function indexFeatureCollection(featureCollection){
    out = {};
    let features=featureCollection.features;
    for(let i=0;i<features.length;i++){
	out[feature.id]=feature;
    }
    return out
}
*/

class IndexedFeatureCollection {

    constructor(featureCollection){
	this.indexed = {};
	let features=featureCollection.features;
	for(let i=0;i<features.length;i++){
	    let feature=features[i];
	    feature["index"]=i;
	    this.indexed[feature.id]=feature;
	}
    }

    getFeature(id){
	let nodeId=id;
	if(this.indexed[nodeId]){
	    return this.indexed[nodeId]
	}else{
	    return false
	}
    }

    getFeatureIndex(id){
	if(this.indexed[id]){
	    return this.indexed[id].index
	}else{
	    return false
	}
    }
}



// geojson tools


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

    let indexedHistory = new IndexedFeatureCollection(history);

    let geoFeatures=geo.features;
    
    for(let i=0;i<geoFeatures.length;i++){

	let geoFeature = geoFeatures[i];
	
	let geoNodeId = geoFeature.id;
	let geoId = geoFeature.properties.id;
        let geoVersion= geoFeature.properties.meta.version;

	let historyFeature=indexedHistory.getFeature(geoNodeId);

	//let isCached = false;
	let needsUpdate = false;
	if(historyFeature){
	    //isCached=true;
	    //console.log(geoNodeId+" is cached");
	    let historyVersion = historyFeature.properties.history.length;

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
	    let properties = { history: hist }
	    let feature = makeFeature(hist[0].id,properties);
            updateFeature(history,feature);

	    /*
	    if(isCached){
		replaceFeature(history,feature);
	    }else{
		pushFeature(history,feature);
	    }
	    */
	}
    }
    return history;
    
}


let historyPath="history.geojson";
let geoPath="../sorbusdomestica.geojson";

let geo=JSON.parse(read(geoPath));


let history = getCachedHistory(historyPath);

history = await updateHistory(history,geo);

writeCachedHistory(historyPath,history)



console.log("ende")


//process.stdout.write(JSON.stringify(History,null,2)+"\n")
//let nodes= [ "10261113000", "10261279253" ];

/*
let distory=diffHistory(history)
    

let uhu=getChanges(distory,"circumference");

console.log(JSON.stringify(uhu,null,2)+"\n");
*/

/*
let zeit=ISOtoYear('2020-11-06T01:30:00.000Z')

console.log(zeit);

setTimeout( function(){console.log("*")},3000)

//process.stdout.write(JSON.stringify(out,null,2));




//uhu();
    
*/
