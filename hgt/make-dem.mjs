#!/usr/bin/env node

/*
const TileSet = require('srtm-elevation').TileSet;
const xyz = require("xyz-affair");
const Jimp = require("jimp");
const tilebelt= require("@mapbox/tilebelt");
*/

import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

//import { TileSet } from 'srtm-elevation';
import pkg from 'srtm-elevation';
const { TileSet } = pkg;


//import {xyz} from 'xyz-affair';
import pkg1 from 'xyz-affair';
const xyz = pkg1;

import {Jimp} from 'jimp';
import * as tilebelt from '@mapbox/tilebelt';


function getElevationPromise(tileset, lat, lon, options={}){
    return new Promise( function(resolve, reject){
        tileset.getElevation( [lat,lon] , function(err, elevation){
            if(err){
                reject(err)
            }else{
                resolve(elevation)
            }
        }, options);
    });
}

function lerp(start, stop, f){
    return start + (stop - start) * f
}

let last;
async function makeDem(bbox){
    let dx=bbox.east-bbox.west;
    let dy=bbox.north-bbox.south;
    let nx=Math.round(dx*3601)+1;
    let ny=Math.round(dy*3601)+1;
    console.log(dx,dy,nx,ny);
    let image= new Jimp({ width: nx, height: ny, color: 0x000000ff} );
    for(let x=0;x<nx;x++){
	for(let y=0;y<ny;y++){
	    let lon=lerp(bbox.w,bbox.e,x/nx);
	    let lat=lerp(bbox.s,bbox.n,y/ny);
	    //console.log(lat,lon);
	    let ans = await getElevationPromise(tileset, lat, lon);
	    //let color = 0xff0000ff
	    let ele=ans.ele;
	    let color;
	    //console.log(ans.ele);
	    if(ele>0){
		color=Math.round(ans.ele)*shift*10 + 255
		last=color;
	    }else{
		color=last;
	    }
	    image.setPixelColor(color,x,y);
	}
    }
    return image
}

let tileset= new TileSet('data1');


/* info-512.json
{
  "zoom": 17,
  "bbox": {
    "south": 47.4421023235537,
    "west": 7.77197331796875,
    "north": 47.44581741085444,
    "east": 7.77746648203125
  }
*/


async function processGeojson(geo){
    let features=geo.features;
    for(let i=0;i<features.length;i++){
	let feature=features[i];
	let id=feature.id;
	let path='/home/stotz.basil/git/map2image/'+id+'/';
	let size=512
	process.stderr.write(path+'info-'+size+'.json\n');
	if(existsSync(path+'info-'+size+'.json')){
	    process.stderr.write('.');
	    let info=JSON.parse(readFileSync(path+'info-'+size+'.json','utf-8'));
	    console.log(info)
	    let image = await makeDem(info.bbox);
	    await image.write(path+'dem-'+size+'.png');
	}
    }
}


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

