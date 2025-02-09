#!/usr/bin/env node

const fs = require('fs');
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}

/*
const { execSync } = require('child_process');
function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
*/

function addMeta(geodata){

    var geo=JSON.parse(geodata);
    
    var bilder;
    var path=process.argv[2];
    
    if (fs.existsSync(path)) {
	bilder=JSON.parse(fs.readFileSync(path));
    } else {
	console.log("file not found");
    }


    for (let i=0;i<geo.features.length;i++){
	
	let properties=geo.features[i].properties;
	
        let id=properties.id;
	if(bilder[id]){
	    properties['pictures_url_prefix']='https://speierling.arglos.ch/node/'+id+'/';
	    properties['pictures']=bilder[id];


	    // add media collection
	    let mediaCollection = {
		type: "mediaCollection",
		pictures: [],
		videos: [],
		documents: []
	    }

	    //let properties= feature.properties
	    if(properties.pictures){
		let url = properties.pictures_url_prefix;
		for(let i=0;i<properties.pictures.length;i++){
		    let picture= properties.pictures[i];
		    let medium = { picture: url+picture, thumb: url+'thumbs/'+picture }
		    mediaCollection.pictures.push(medium);
		}       
		properties.media = mediaCollection;
	    }
	    
	}
	
    }
    
    process.stdout.write(JSON.stringify(geo,null,2)+'\n');
	    
}


var chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    addMeta(chunks)
});


