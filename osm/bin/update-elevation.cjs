#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

/*
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}
function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
*/

const delay = (duration) => {
    return new Promise(resolve => setTimeout(resolve,duration))
};

async function addMeta(geodata){

    let geo=JSON.parse(geodata)
    
    var features=geo.features;

    if (fs.existsSync(path)) {
	addons=JSON.parse(fs.readFileSync(path));
    } else {
	process.exit(1);
	process.stderr.write('error: cachefile not found\n');
	//addons={};
    }

    //search loop
    let missing=[];
    for(let i=0;i<features.length;i++){
	let feature=features[i];
	let id=feature.id;	
	if(!addons[id])missing.push(feature)
    }

    // aquire loop
    let max=50;
    let total=missing.length;
    let start=0;
    let stop;
    
    while(start<total){
        stop=start+max;
	if(stop>total)stop=total;

	locations='';
	for(let i=start;i<stop;i++){
	    let feature=missing[i];
	    let lat=feature.geometry.coordinates[1];
  	    let lon=feature.geometry.coordinates[0];
	    if(i>start)locations+='|';
	    locations+=lat+','+lon;
	}
       
	//let result={};
	try{
	    const url='https://api.opentopodata.org/v1/srtm30m?locations='+locations;
            await delay(1100);
	    //process.stderr.write(url+'\n');
	   
	    const response= await fetch(url);
	    const result = await response.json();
            if(result.status=='OK'){
		process.stderr.write('info: status ok\n');
		for(let i=start;i<stop;i++){
		    let res=result.results[i-start];
		    let id=missing[i].id;
		    addons[id]={ ele: res.elevation }; 
		}
	    
	    }else{
		process.stderr.write('error: lookup status not ok\n');
	    }  
	} catch {
	    process.stderr.write('error: lookup elevation failed\n')
	}
	start=stop;
    }

    //merge loop
    for(let i=0;i<features.length;i++){
	let feature=features[i];
	let id=feature.id;	    
	if(addons[id]&&addons[id].ele){
	    features[i].geometry.coordinates[2]=addons[id].ele;
	}
    }
    
    fs.writeFileSync(path,JSON.stringify(addons));
    process.stdout.write(JSON.stringify(geo,null,2)+'\n');
}

async function doIt(){
    if (fs.existsSync(path)) {
	addons=JSON.parse(fs.readFileSync(path));
    } else {
	addons={};
    }
    await addMeta(chunks)
    fs.writeFileSync(path,JSON.stringify(addons));
}

//var path='geojson-meta-cache.json';
let path=process.argv[2];
if(!path){
    process.stderr.write('usage: update-elevation.cjs <elevationcache>\n');
    process.exit(1);
}

var changed=false;
var addons;
    
var chunks = '';

process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});

process.stdin.on('end', () => {
    addMeta(chunks);
});


