#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

/*
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}
function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
*/

function addMeta(geodata){

    var geo=JSON.parse(geodata);
    
    var addons;
    var path='cache/geojson-meta-cache.json';
    var changed=false;
    
    if (fs.existsSync(path)) {
	addons=JSON.parse(fs.readFileSync(path));
    } else {
	addons={};
    }

    for (let i=0;i<geo.features.length;i++){
	
	let item=geo.features[i];
	
        let id=item.id;
	if(!addons[id]){
	    
	    changed=true;
	    process.stderr.write('add id: '+id+'\n');

	    var res;
	    
	    let latitude=item.geometry.coordinates[1];
  	    let longitude=item.geometry.coordinates[0];
/*
	    //elevation
	    try{
		let url='curl -s https://api.opentopodata.org/v1/test-dataset?locations=';
		//let url='curl -s https://api.open-elevation.com/api/v1/lookup?locations=';
	        let ans=execSync(url+latitude+','+longitude);
		res=JSON.parse(ans);
	    }
	    catch { process.stderr.write('lookup elevation failed\n'); }
		    
	    let elevation;
	    if(res.results[0].elevation){
		elevation=res.results[0].elevation;
	    }else{
		elevation=null;
	    }
*/
            //nominatim
	    res={};
	    try{
		ans=execSync('curl -s  "https://nominatim.openstreetmap.org/reverse?format=json&lat='+latitude+'&lon='+longitude+'&zoom=10"');
		res=JSON.parse(ans);
            }
	    catch { process.stderr.write('lookup nominatim failed\n'); }	    
	    addons[id]={ nominatim: { address: res.address, display_name: res.display_name }, elevation: elevation };
	}

	geo.features[i].properties['nominatim']=addons[id].nominatim;
	geo.features[i].geometry.coordinates[2]=addons[id].elevation;	
    }
    
    if(changed)fs.writeFileSync(path,JSON.stringify(addons));
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


