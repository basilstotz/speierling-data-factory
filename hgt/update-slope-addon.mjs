#!/usr/bin/env node

import { HGTDem } from './../modules/HGTDem.mjs'
//import { Jimp } from 'jimp';
import fs from 'node:fs'

/*
let info = {
  "zoom": 16,
  "bbox": {
    "south": 47.4402446815151,
    "west": 7.7692267359375,
    "north": 47.447674856117324,
    "east": 7.7802130640625
  },
  "center": {
    "lat": 47.4439599,
    "lon": 7.7747199
  },
  "template": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "width": 512,
  "height": 512
}
*/

let count=0;


async function processGeojson(geo){

    let features= geo.features;
    for(let i=0;i<features.length;i++){
	let feature=features[i];
	let prop=feature.properties;
	let id=prop.id;
	let coordinates=feature.geometry.coordinates
	
	if(!addon[id]){
	    addon[id]= await hgt.getSlope(coordinates[1],coordinates[0])
	}
    }
    fs.writeFileSync(addonFile,JSON.stringify(addon,null,2));
    process.stdout.write(JSON.stringify(geo,null,2));
}


function usage(){
    process.stderr.write('usage: cat <name.geojson> | ./make-slope-addon <hgtDir> <addonfile>\n');
    process.exit(1);
}



//main
let hgtPath;
let addonFile;
let hgt;
//let force=false;

let addon;

if(!process.argv[2]){
    usage();
}else{
    hgtPath=process.argv[2];
    if(!hgtPath.endsWith('/'))hgtPath+='/';
    if(!fs.existsSync(hgtPath)){
	process.stderr.write('error: could not find "'+hgtPath+'"\n');
	process.exit(1);
    }
}

if(!process.argv[3]){
    usage();
}else{
    addonFile=process.argv[3];
    if(!fs.existsSync(addonFile)){
	process.stderr.write('error: could not find "'+addonFile+'"\n');
	process.exit(1);
    }
}

//if(process.argv[4])force=true;

hgt = new HGTDem(hgtPath);
addon=JSON.parse(fs.readFileSync(addonFile,'utf-8'));

	
var chunks = '';

process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});

process.stdin.on('end', async () => {
    await processGeojson(JSON.parse(chunks))
});

