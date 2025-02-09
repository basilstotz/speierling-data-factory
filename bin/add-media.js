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


          // old order
            properties['pictures_url_prefix']=;
            properties['pictures']=bilder[id];
            

            // new order
            // should "media_collection" not "media"
            if(feature.properties.pictures_url_prefix){
                tags.media=feature.properties.pictures_url_prefix+"media.json"
                tags["media_collection"]=feature.properties.pictures_url_prefix+"media.json"
            }

            if(feature.properties.pictures){
                tags["meta:media_size"]=feature.properties.pictures.length;
            }
            
            //add media collection
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

*/







function addMedia(geodata){

    var geo=JSON.parse(geodata);
    
    var bilder;
    var path=process.argv[2];
    
    if (fs.existsSync(path)) {
	bilder=JSON.parse(fs.readFileSync(path));
    } else {
	console.log("file not found");
        process.exit(1);
    }


    for (let i=0;i<geo.features.length;i++){

	let feature=geo.features[i];
	let properties=feature.properties;
	let tags=properties.tags;
        let id=properties.id;

	if(bilder[id]){
             let urlPrefix = 'https://speierling.arglos.ch/node/'+id+'/'
             tags.media=urlPrefix+"media.json"
             tags["media_collection"]=urlPrefix+"media.json"
             tags["meta:media_size"]=bilder[id].length;

            properties.media=bilder[id];
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
    addMedia(chunks)
});
