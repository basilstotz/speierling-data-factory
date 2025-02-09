#!/usr/bin/env node

function stderr(t){
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

function isNumber(x){
    let value = parseFloat(x);
    return (typeof value === "number" && !Number.isNaN(value)) 
}

let ISO_8601 = new RegExp( /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/,"i");



/// goes to karte.js
function checkTags(geojson){

    /////////////////////////////////////////
    /////     clean and update tags     /////
    /////////////////////////////////////////



    
    for(let i=0;i<geojson.features.length;i++){
	let tags=geojson.features[i].properties.tags;

	if(tags.planted_date&&!tags.start_date){
           tags.start_date=tags.planted_date;
	   //delete tags.planted_date;
        }
	
	if(tags.start_date){
	    if(! ISO_8601.test(tags.start_date)){ delete tags.start_date }
	}

	if(tags.circumference){
	    if(!isNumber(tags.circumference)){
		delete tags.circumference
	    }else{
		let c=parseFloat(tags.circumference);
		if(c>5.0)c=c/100.0;
		tags.circumference=c;
	    }
	}
	if(tags.height){
	    if(!isNumber(tags.height)){
		delete tags.height
	    }else{
		tags.height=parseFloat(tags.height)
	    }
	}
	if(tags.diameter_crown){
	    if(!isNumber(tags.diameter_crown)){
		delete tags.diameter_crown
	    }else{
		tags.diameter_crown=parseFloat(tags.diameter_crown)
	    }
	}
	
    }
    return geojson;
}



function processGeojson(geoIn){


    let geoOut=checkTags(geoIn);

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
