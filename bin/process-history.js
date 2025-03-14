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

function isNumber(x){
    let n=parseFloat(x);
    return (typeof n === "number" && !Number.isNaN(n)) 
}

let ISO_8601 = new RegExp( /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/,"i");

function decimalYear(dateString){
    let date = new Date(dateString);
    let zeit=date.getFullYear()+(1.0/12.0)*date.getMonth()+(1.0/365.0)*date.getDate();
    return Math.round(zeit*1000)/1000.0
}


function filterOutdated(feature,history){

    //console.log(history)
    let first = history[0];
    let last = history[history.length-1];

    let sd;
    if(last.tags['start_date']){
	let lts = last.tags['start_date']
	if(ISO_8601.test(lts)){  
	    sd=lts;
	}else{
	    //console.log(lts);
	    sd='1000-01-01'
	}
    }else{
	sd='1000-01-01'
    }
    let startDate=decimalYear(sd);
    
    let out= [];
    for(let i=0;i<history.length;i++){
	let hist= history[i];
	let historyDate=decimalYear(hist.timestamp);
	if(historyDate>=startDate)out.push(hist);
    }
    return out;
}

function addHistoric(feature, history){

    let first = history[0];
    let tags=feature.properties.tags;

    out = [];

    Object.entries(tags).forEach( ([key,value]) => {
	if(key.includes(':historic:')){
	    cont = key.split(':');
	    let newKey = cont[0];
	    let newTime = cont[2];
	    let hist = clone(first);
	    hist.tags[newKey] = value;
	    hist['timestamp'] = newTime+'-01-01T00:00:00Z';
            out.push(hist);	   
	}
    });
    
    history.forEach( hist => {out.push(hist)} );

    return out;
}

function diffHistory(history){

    //console.log(history)
    
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

		let ok=true;
                switch(key){
		case 'circumference':
		case 'height':
		case 'diameter_crown':
		    if(!isNumber(newVal))ok=false;
		    break;
		case 'start_date':
		    if(!ISO_8601.test(newVal))ok=false;
		}

		if(newVal!=oldValues[key] && ok){
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

/*
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
*/



function addHistory(geoIn){

    //let indexedHistory = new IndexedFeatureCollection(history);
    
    //let geoOut = makeFeatureCollection(); 
    
    let features=geoIn.features;
    for(let i=0;i<features.length;i++){
	let feature=features[i];
	
	let geoId=feature.id;
	let properties=feature.properties;

	let fullhistory=properties.fullhistory;

	if(fullhistory){
	   
            let stageone = filterOutdated( feature, fullhistory )
	    //console.log(stageone)
	    let stagetwo = addHistoric( feature, stageone );
            //console.log(stagetwo)
	    properties["history"] = diffHistory(stagetwo);
	    properties["historynew"] = 'yes';

	    delete properties['fullhistory'];
	}
    }
    process.stdout.write(JSON.stringify(geoIn,null,2));
}


/*
let historyPath; //="history.geojson";

if(process.argv[2]){
    historyPath=process.argv[2]
}else{
    stderr("usage: process-history <history_geojson>");
    process.exit(1)
}

let history = JSON.parse(read(historyPath));
*/

let chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    let geo =JSON.parse(chunks);
    
    //addHistory(geo, history)
    addHistory(geo)
});


