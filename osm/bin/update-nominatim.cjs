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

async function addMeta(geodata){

    let count=0;
    
    var geo=JSON.parse(geodata);

    if (fs.existsSync(path)) {
	addons=JSON.parse(fs.readFileSync(path));
    } else {
	process.exit(1);
	//addons={};
    }

    
    for (let i=0;i<geo.features.length;i++){
	
	let item=geo.features[i];
	
        let id=item.id;
	
	if(!addons[id]&&count<200){
            count++;
            //process.stderr.write('get '+id);	    
	    changed=true;
	    process.stderr.write('add id: '+id+'\n');

	    var res;
	    
	    let lat=item.geometry.coordinates[1];
  	    let lon=item.geometry.coordinates[0];
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
                const url='https://nominatim.openstreetmap.org/reverse?format=geocodejson&lat='+lat+'&lon='+lon+'&layer=address&email=basil.stotz@gmail.com';
		//process.stderr.write(url+'\n');
                const response= await fetch(url);
		const res = await response.json();
		//ans=execSync('curl -s "' + url + '" 2>/dev/null');
		//res=JSON.parse(ans);
                addons[id]={ geocoding: res.features[0].properties.geocoding }; 
            }
	    catch { process.stderr.write('lookup nominatim failed\n') }	    
	    //addons[id]={ nominatim: { address: res.address, display_name: res.display_name };
	}

	if(addons[id]&&addons[id].geocoding)geo.features[i].properties['geocoding']=addons[id].geocoding;
	//geo.features[i].geometry.coordinates[2]=addons[id].elevation;	
    }
    
    if(changed)fs.writeFileSync(path,JSON.stringify(addons));
    process.stdout.write(JSON.stringify(geo,null,2)+'\n');
}

async function doIt(){
    if (fs.existsSync(path)) {
	addons=JSON.parse(fs.readFileSync(path));
    } else {
	addons={};
    }
    await addMeta(chunks)
    if(changed)fs.writeFileSync(path,JSON.stringify(addons));
}

//var path='geojson-meta-cache.json';
let path=process.argv[2];
if(!path){
    process.stderr.write('usage: update-nominatim.cjs <historycache>\n');
    process.exit(1);
}

var changed=false;
var addons;
    
var chunks = '';

process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});

process.stdin.on('end', () => {
    addMeta(chunks);
});


