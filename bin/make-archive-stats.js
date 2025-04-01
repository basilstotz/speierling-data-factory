#!/bin/env node

const fs = require('node:fs');
/*
const isDir = fileName => {
  return fs.lstatSync(fileName).isDir();
};
*/

out = {};

fs.readdirSync('../archive/')
    .map(fileName => {
	//console.log(fileName)
        calc(fileName)
  })

// 2023-07-08 ./archive/2023-07-08-172441/sorbusdomestica.geojson

function calc(dirName){

    let timestamp=dirName.slice(0,10);
    let fileName ='./../archive/'+dirName+'/sorbusdomestica.geojson';

    //console.log(dirName,timestamp,fileName);

    
    let content = fs.readFileSync(fileName);
    let geo = JSON.parse(content);
    features= geo.features
    let pics = 0;
    let trees = features.length;
    for(let i=0;i<features.length;i++){
	let feature= features[i];
	if(feature.properties.pictures){
	    pics+=feature.properties.pictures.length;
	}else{
	    if(feature.properties.media&&feature.properties.media.pictures)pics+=feature.properties.media.pictures.length;
	}
    }
    out[timestamp]= { trees: trees, pics: pics }

}

let text='var archive = \n'+JSON.stringify(out,null,2)+';';

//process.stderr.write(text);
fs.writeFileSync('archive-stats.js',text );
