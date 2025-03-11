#!/usr/bin/env node

import { HGTDem } from './modules/HGTDem.mjs'
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

const dem = new HGTDem('data1');

const path='.'

async function makeDem(info, dirName){
    let demName= dirName+'dem-'+info.width+'.png';    
    if(!fs.existsSync(demName)){
        await dem.makeImage(info.bbox,info.zoom);
	await dem.writeImage(demName);
    }
}

async function doit(){
    fs.readdirSync(path).map( (dirName) => {
	if(fs.lstatSync(dirName).isDirectory()){
            fs.readdirSync(dirName).map( (filename) => {
		if(filename.match(/info-.*\.json/)){
		    console.log('ja: '+filename);
		    let info=JSON.parse(readFileSync(dirName+filename,'utf-8'));
		    makeDem(info,dirName);
		}  
	    })
	}	
    })
}
					

await doit();

//console.log(await dem.getElevation(47.5,7.5))
//await dem.makeImage(info.bbox,info.zoom);
//await dem.writeImage('bild.png')


/*

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
*/

