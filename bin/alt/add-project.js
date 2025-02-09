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
    
    var project={};    
    var path=process.argv[2];
    
    if (fs.existsSync(path)) {
	let pro=JSON.parse(fs.readFileSync(path));
	for(let i=0;i<pro.length;i++){
	    let item=pro[i];
            item.line=i;
            if(item.Node)project[item.Node]=item;
        }
    } else {
	console.log("file not found");
    }


    //add project
    for (let i=0;i<geo.features.length;i++){
	
	let item=geo.features[i];
	
        let id=item.properties.id;
	if(project[id]){
	    geo.features[i].properties['project']=project[id];
	}
    }

    //sort
    let out= { "type": "FeatureCollection",
               "features": []
             };

    // black
    for (let i=0;i<geo.features.length;i++){
	let item=geo.features[i];	
	if(!item.properties.project){
	    out.features.push(item);
	}else{
	    if(!item.properties.project.Vermehrungstyp){
		out.features.push(item);
	    }else{
		switch(item.properties.project.Vermehrungstyp){
		   case 'P':
		   case 'N':
		   case 'U':
		   case 'TR':
		   case 'TS':
			break;
		   default:
			out.features.push(item);
			break;
                }
	    }
	}
    }

    // blue
    for (let i=0;i<geo.features.length;i++){	
	let item=geo.features[i];
	if(item.properties.project && item.properties.project.Vermehrungstyp){
            let Vermehrungstyp=item.properties.project.Vermehrungstyp;
	    if(Vermehrungstyp=='P')out.features.push(item);
	}
    }

    // green/olive
    for (let i=0;i<geo.features.length;i++){	
	let item=geo.features[i];
	if(item.properties.project && item.properties.project.Vermehrungstyp){
            let Vermehrungstyp=item.properties.project.Vermehrungstyp;
	    if( (Vermehrungstyp=='N')||(Vermehrungstyp=='U') )out.features.push(item);
	}
    }

    // orange
    for (let i=0;i<geo.features.length;i++){	
	let item=geo.features[i];
	if(item.properties.project && item.properties.project.Vermehrungstyp){
            let Vermehrungstyp=item.properties.project.Vermehrungstyp;
	    if( Vermehrungstyp=='TR' )out.features.push(item);
	}
    }

    // red
    for (let i=0;i<geo.features.length;i++){	
	let item=geo.features[i];
	if(item.properties.project && item.properties.project.Vermehrungstyp){
            let Vermehrungstyp=item.properties.project.Vermehrungstyp;
	    if( Vermehrungstyp=='TS' )out.features.push(item);
	}
    }


    process.stdout.write(JSON.stringify(out,null,2)+'\n');
	    
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


