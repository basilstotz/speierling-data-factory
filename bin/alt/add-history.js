#!/usr/bin/env node

const fs = require('fs');

    
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

// maybe a class FeatureCollection?
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
	//console.log(history[i]);
	let tags=history[i].tags;
	if(tags){
	    Object.entries(tags).forEach( ([key,value]) => {
		oldValues[key]="";
	    });
	}
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
	if(tags){
	    Object.entries(tags).forEach( ([key,newVal]) => {
		if(newVal!=oldValues[key]){
		    changed=true;
		    oldValues[key]=newVal;
		    diffValues[key]=newVal;
		}
	    })
	}
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




function addHistory(geoIn){

    let indexedHistory = new IndexedFeatureCollection(history);
    
    //let geoOut = makeFeatureCollection(); 
    
    let features=geoIn.features;
    for(let i=0;i<features.length;i++){
	let geoId=features[i].id;
	let properties=features[i].properties;

	let historyFeature=indexedHistory.getFeature(geoId)
	if(historyFeature){
            let history=historyFeature.properties.history;
	    //properties["history"] = history;
	    properties["history"] = diffHistory(history);
	}
    }
    process.stdout.write(JSON.stringify(geoIn,null,2));
}

let historyPath; //="history.geojson";

if(process.argv[2]){
    historyPath=process.argv[2]
}else{
    stderr("usage: add-history <history_geojson>");
    process.exit(1)
}

let history = JSON.parse(read(historyPath));

let chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    addHistory(JSON.parse(chunks))
});


