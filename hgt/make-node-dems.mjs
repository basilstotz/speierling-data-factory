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
	let infoFile=nodePath+id+'/info-512.json'
	if(fs.existsSync(infoFile)){
	    let demFile=nodePath+id+'/dem-512.png';
	    if(force || !fs.existsSync(demFile)){
		let info= JSON.parse(fs.readFileSync(infoFile,'utf-8'));
		
		process.stderr.write('.');
//console.log(info,info.bbox,info.zoom);
		let img= await dem.makeImage(info.bbox,info.zoom);
//if(i==10)console.log(img);
		await dem.writeImage(demFile);
	    }
	}
    }
    process.stdout.write(JSON.stringify(geo,null,2));
}


function usage(){
    process.stderr.write('usage: cat <name.geojson> | ./make-node-dems <hgtDir> <nodeDir>\n');
    process.exit(1);
}



//main
let hgtPath;
let nodePath;
let dem;
let force=false;

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
    nodePath=process.argv[3];
    if(!nodePath.endsWith('/'))nodePath+='/';
    if(!fs.existsSync(hgtPath)){
	process.stderr.write('error: could not find "'+nodePath+'"\n');
	process.exit(1);
    }
}

if(process.argv[4])force=true;

dem = new HGTDem(hgtPath);


	
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

