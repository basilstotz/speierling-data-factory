#!/usr/bin/env node

//                     [ west,south],[east,north ]
//let bounds= [ [6.02260949059,45.7769477403],[10.4427014502,47.8308275417] ];

let bounds= { west:6.02260949059, south:45.7769477403, east: 10.4427014502,north: 47.8308275417}
//schweiz:
//   [ 45.7769477403,10.4427014502],
//    [ 47.8308275417,6.02260949059]



//let tile= tilebelt.pointToTile(lon,lat,zoom);


hgt= new HGTTilset('data1');

hgt.makeTilesFromBBOX(bounds,12,'tiles');



