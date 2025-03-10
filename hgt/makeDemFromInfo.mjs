#!/usr/bin/env node

import { HGTDem } from './HGTDem.mjs'
//import { Jimp } from 'jimp';
import { readFileSync,existsSync,mkdirSync } from 'node:fs'

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
//console.log(await dem.getElevation(47.5,7.5))
//await dem.makeImage(info.bbox,info.zoom);
//await dem.writeImage('bild.png')


async function processGeojson(geo){
    let features=geo.features;
    for(let i=0;i<features.length;i++){
        let feature=features[i];
        let id=feature.id;
        let path='/home/stotz.basil/git/speierling-site/data/'+id+'/';
        let size=512
        //process.stderr.write(path+'info-'+size+'.json\n');
        if(existsSync(path+'info-'+size+'.json')){
            process.stderr.write('.');
            let info=JSON.parse(readFileSync(path+'info-'+size+'.json','utf-8'));
            //console.log(info)
            await dem.makeImage(info.bbox,info.zoom);
            await dem.writeImage(path+'dem-'+size+'.png');
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


