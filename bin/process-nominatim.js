#!/usr/bin/env node

function logger(t){
    process.stderr.write(JSON.stringify(t,null,2)+"\n");
}
    
function martin(text){
    let trimmed=text.toString().trim();
    let cleaned=trimmed.replace(/(\r\n|\n|\r)/gm, " ");
    return cleaned;
}

function decimalYear(dateString){
    let date = new Date(dateString);
    let zeit=date.getFullYear()+(1.0/12.0)*date.getMonth()+(1.0/365.0)*date.getDate();
    return Math.round(zeit*1000)/1000.0
}


function clone(x){
    return JSON.parse(JSON.stringify(x))
}


function processNominatim(geoIn){

    let allow= [ 'city', 'county', 'state', 'country' ];
    
    let features= geoIn.features;
    for(let i=0;i<features.length;i++){
	let feature=features[i];
        let tags=feature.properties.tags;
	
	    // process nominatim	
	let geocoding=feature.properties.geocoding;
	let addrArray=Object.entries(geocoding);
	addrArray.forEach( ([key,value]) => {
	    if( allow.includes(key) ){
		let tag="addr:"+key;
		tags[tag]=value;	
	    }
	});
	tags["addr:gemeinde"]=geocoding['city'];
	
	if(geocoding['name']){
	    tags['addr:gebiet']=geocoding['name']
	}else if(geocoding['locality']){
	    tags['addr:gebiet']=geocoding['locality']
	}else if(geocoding['district']){
	    tags['addr:gebiet']=geocoding['district']
	}
	
	if(geocoding.label){
	    let la=geocoding.label.split(',');
	    let lla=[]
	    la.forEach( (item) => { lla.push(item.trim())})
	    let index=lla.indexOf(geocoding.city);
	    let da;
	    if(index>0){
		da=lla.slice(index);
	    }else{
		da=lla
	    }
	    tags["addr:full"]=da.join(', ');
	    tags['addr:label']=geocoding.label;
	    
	}
	if(feature.properties.geocoding){ delete feature.properties.geocoding }


	// cleanup ---> does not belong here!!!
	if(feature.properties.meta){ delete feature.properties.meta }
	if(feature.properties.relations){ delete feature.properties.relations }
    }
    return geoIn
}




function processGeojson(geoIn){


    let geoOut=processNominatim(geoIn);

    process.stdout.write(JSON.stringify(geoOut,null,2)+'\n');	    
}



var chunks = '';
process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});
process.stdin.on('end', () => {
    processGeojson(JSON.parse(chunks))
});
