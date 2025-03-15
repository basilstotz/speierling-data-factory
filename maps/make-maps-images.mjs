#!/usr/bin/env node

import { XYZTileset } from '../modules/XYZTileset.mjs';
import { existsSync,mkdirSync } from 'node:fs';

async function processGeojson(geo){

    const width=512;
    const height=512;
    const zoom=16;

    
    let tileset = new XYZTileset();
    let features=geo.features;

    let osmOpts= {
	template: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	cachedir: tilePath+'osm'
    }
    tileset.setOptions(osmOpts);
    
    for(let i=0;i<features.length;i++){
	const feature=features[i];
	const id=feature.properties.id;
	const lat=feature.geometry.coordinates[1];
	const lon=feature.geometry.coordinates[0];
              
	let path=nodePath+id+'/'
	if(!existsSync(path+'osm-512.png')){
	    process.stderr.write('.');
	    if(!existsSync(path))mkdirSync(path,{recursive:true});
	    await tileset.getImageByPos(lat,lon,zoom,width,height);
	    await tileset.writeImage(path+'osm-512.png');
	    await tileset.writeInfo(path+'info-512.json');
	}	
    }

    let esriOpts= {
	template: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
	cachedir: tilePath+'esri'
    }
    tileset.setOptions(esriOpts);
    
    for(let i=0;i<features.length;i++){
	const feature=features[i];
	const id=feature.properties.id;
	const lat=feature.geometry.coordinates[1];
	const lon=feature.geometry.coordinates[0];
              
	let path=nodePath+id+'/'
	if(!existsSync(path+'esri-512.png')){
	    process.stderr.write(',');
	    await tileset.getImageByPos(lat,lon,zoom,width,height);
	    await tileset.writeImage(path+'esri-512.png');
	    //await tileset.writeInfo(path+'info-512.json');
	}	
    }
    tileset.logInfo();
}



function usage(){
    process.stderr.write('usage: cat <file.geojson> | ./make-maps-images.mjs <nodeDir> <tileDir>\n');
    process.exit(1);
}




let nodePath;
let tilePath;

if(process.argv[2]){
    if(existsSync(process.argv[2])){
	nodePath=process.argv[2];
	if(!nodePath.endsWith('/'))nodePath+='/';
    }else{
	process.stderr.write('error: could not find "'+nodePath+'"\n');
	process.exit(1);
    }
}else{
    usage();
}

if(process.argv[3]){
    if(existsSync(process.argv[3])){
	tilePath=process.argv[3];
	if(!tilePath.endsWith('/'))tilePath+='/';
    }else{
	process.stderr.write('error: could not find "'+tilePath+'"\n');
	process.exit(1);
    }
}else{
    usage();
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
