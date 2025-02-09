#!/bin/env node

const fs = require('node:fs');
/*
const isDir = fileName => {
  return fs.lstatSync(fileName).isDir();
};
*/

out = {};

fs.readdirSync('./archive/')
    .map(fileName => {
	//console.log(fileName)
        calc(fileName)
  })



function calc(dirName){

    let timestamp=dirName.slice(0,10);
    let fileName ='./archive/'+dirName+'/sorbusdomestica.geojson';

    console.log(timestamp,fileName);

    let content = fs.readFileSync(fileName);
    let geo = JSON.parse(content);
    features= geo.features
    let pics = 0;
    let trees = features.length;
    for(let i=0;i<features.length;i++){
	let feature= features[i];
	if(feature.properties.pictures)pics+=feature.properties.pictures.length;
    }
    out[timestamp]= { trees: trees, pics: pics }

}

fs.writeFileSync('archive-stats.json', JSON.stringify(out,null,2));
