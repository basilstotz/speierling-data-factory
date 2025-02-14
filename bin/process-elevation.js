#!/usr/bin/env node


function processElevation(geodata){

    var geo=JSON.parse(geodata);
    

    for (let i=0;i<geo.features.length;i++){

	let feature=geo.features[i];
	let tags=feature.properties.tags;
        let ele=feature.geometry.coordinates[2];

	if(ele)tags['ele'] = ele;
        	
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
    processElevation(chunks)
});
