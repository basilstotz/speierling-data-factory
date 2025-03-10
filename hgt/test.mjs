#!/usr/bin/env node

import { HGTDem } from './HGTDem.mjs';
import * as utils from './../../git/map2image/map-utils.mjs';

let hgt = new HGTDem('data1');

let x,y;


for(let z=8;z<18;z++){
    x = utils.lon2tile(7.5,z);
    y= utils.lat2tile(45.5,z)
    await hgt.makeTile(x,y,z);
    await hgt.writeTile('new');
}

/*
let bbox = { west: 7.5, east:7.6, south:47.5, north:47.6};
await hgt.makeImage(bbox,8)
await hgt.writeImage('bild-08.png');

await hgt.makeImage(bbox,10)
await hgt.writeImage('bild-10.png');

await hgt.makeImage(bbox,12)
await hgt.writeImage('bild-12.png');

await hgt.makeImage(bbox,14)
await hgt.writeImage('bild-14.png');

await hgt.makeImage(bbox,16)
await hgt.writeImage('bild-16.png');
*/

