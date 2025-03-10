#!/usr/bin/env node

/*
const TileSet = require('srtm-elevation').TileSet;
const xyz = require("xyz-affair");
const Jimp = require("jimp");
const tilebelt= require("@mapbox/tilebelt");
*/

import { mkdirSync,existsSync } from 'node:fs';

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



let shift=Math.pow(2,16);

// [ 7.3828125, 47.27922900257082, 7.734375, 47.5172006978394 ]
//    lon            lat             lon         lat
//      x             y

function lerp(start,stop,f){
    return start + (stop - start)* f
}

let last;
async function makeTile(tile){
    let num=16; //256/Math.pow(2,tile[2]-12)
    let bbox = tilebelt.tileToBBOX(tile);
    for(let x=0;x<num;x++){
	for(let y=0;y<num;y++){
	    lat=lerp(bbox[1],bbox[3],y/num);
	    lon=lerp(bbox[0],bbox[2],x/num);
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
	    tileImage.setPixelColor(color,x,y);
	}
    }
}

function tilePath(tile){
    let x=tile[0];
    let y=tile[1];
    let z=tile[2];
    return 'tiles/'+z+'/'+x+'/'+y+'.png'
}

function existsTile(tile){
    return(existsSync(tilePath(tile)))
}

async function writeTile(tile){
    let filePath= tilePath(tile);
    let dir=filePath.slice(0,filePath.lastIndexOf('/')+1)
    if(!existsSync(dir))mkdirSync(dir,{recursive:true})
    await tileImage.write(filePath);
}

let tileImage= new Jimp({ width: 256, height:256, color: 0x000000ff} );
let tileset= new TileSet('data1');

let lat=47.5;
let lon=7.5;
let zoom=12;

//                     [ west,south],[east,north ]
let bounds= [ [6.02260949059,45.7769477403],[10.4427014502,47.8308275417] ];
//schweiz:
//   [ 45.7769477403,10.4427014502],
//    [ 47.8308275417,6.02260949059]



//let tile= tilebelt.pointToTile(lon,lat,zoom);

let tiles=xyz(bounds,zoom);
console.log(tiles.length)


for(let i=0;i<tiles.length;i++){
    let t=tiles[i];
    let tile= [ t.x, t.y, t.z ];
    process.stderr.write('.');
 
    if(!existsTile(tile)){
	await makeTile(tile);
	await writeTile(tile);
    }
}



