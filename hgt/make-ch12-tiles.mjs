#!/usr/bin/env node

import fs from 'node:fs';
import { HGTDem } from '../modules/HGTDem.mjs'

//                     [ west,south],[east,north ]
//let bounds= [ [6.02260949059,45.7769477403],[10.4427014502,47.8308275417] ];

let bounds= { west:6.02260949059, south:45.7769477403, east: 10.4427014502,north: 47.8308275417}
//schweiz:
//   [ 45.7769477403,10.4427014502],
//    [ 47.8308275417,6.02260949059]



//let tile= tilebelt.pointToTile(lon,lat,zoom);

let hgtPath;
let tilePath;

function usage(){
    process.stderr.write('usage: ./make-ch12-tiles.mjs <hgtDir> <tileDir\n');
    process.exit(1);
}



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
    tilePath=process.argv[3];
    if(!tilePath.endsWith('/'))tilePath+='/';
    if(!fs.existsSync(tilePath)){
        process.stderr.write('error: could not find "'+tilePath+'"\n');
        process.exit(1);
    }
}

console.log(hgtPath,tilePath);

let hgt= new HGTDem(hgtPath);

//console.log(hgt);
//await hgt.makeImage({ west: 7.5, east:7.8, south: 47.5, north:47.6 },12);
//await hgt.writeImage('bild.png');
await hgt.makeTilesFromBBOX(bounds,12,tilePath);



