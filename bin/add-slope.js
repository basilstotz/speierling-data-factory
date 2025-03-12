#!/usr/bin/env node

const fs = require('fs');
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}




function addSlope(geodata){

    var geo=JSON.parse(geodata);
    
    var slope;
    var path=process.argv[2];
    
    if (fs.existsSync(path)) {
	slope=JSON.parse(fs.readFileSync(path));
    } else {
	console.log("file not found");
        process.exit(1);
    }


    for (let i=0;i<geo.features.length;i++){

	let feature=geo.features[i];
	let properties=feature.properties;
	let tags=properties.tags;
        let id=properties.id;

	if(slope[id]){
	    let s=slope[id];
            tags['slope'] = s.slope;
            tags['aspect'] = s.aspect;
            tags['height'] = s.ele;
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
    addSlope(chunks)
});
