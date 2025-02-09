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
    let zeit=date.getFullYear()+(1.0/12.0)*date.getMonth()+(1.0/365.25)*(date.getDate()-1);
    return Math.round(zeit*1000)/1000.0
}


function clone(x){
    return JSON.parse(JSON.stringify(x))
}


function getChanges(distory,keys){
    let out=[];
    for(let i=0;i<distory.length;i++){

        let line={};
        let dasda=distory[i];

        let first=true;
        for(let j=0;j<keys.length;j++){
            let key=keys[j];
            if(dasda[key]){
               if(first){
                   first=false;
                   line["timestamp"]=dasda["timestamp"];
               }
               line[key]=dasda[key];
            }
        }
        if(!first)out.push(line)
    }
    return out;
}


// adds keys 'circumference:growth','circumference:growth:estimated',
//           'height:growth', 'height:growth:estimated',
//           'start_date:estimated',
//           'latest_update' 

function addGrowth(feature){

    let tags = feature.properties.tags;
    let diffs = feature.properties.history;
    let dim;
    
    if(diffs){
       
	// handle all trees with circumference
	dim = getChanges(diffs, ["circumference"]);
	
	// circumference:growth
	let offset=2                             // weil pflanzahr!=keimjahr => offset=pflanzjahr-keimjahr
	if(tags.start_date && dim.length>=1){
	    let letzter = dim[dim.length-1];
	    let dauer = ( decimalYear(letzter.timestamp)-decimalYear(tags.start_date) ) + offset;
	    let zuwachs = letzter.circumference;
	    let growth= zuwachs/dauer;
	    if(growth<0.05)tags['circumference:growth']=Math.round( (1000.0*growth ))/10.0;
	}
	
	// start_date:estimated , circumference:growth:estimated
	if(dim.length>=2){
	    let erster = dim[0];
	    let letzter = dim[dim.length-1];
	    let dauer = decimalYear(letzter.timestamp)-decimalYear(erster.timestamp);
	    let zuwachs = letzter.circumference - erster.circumference;
	    let relativeZuwachs= zuwachs / letzter.circumference;
	    if( relativeZuwachs>0.01 ||  dauer > 5.0 ){
		let estimatedGrowth=zuwachs/dauer;
		if(estimatedGrowth>0.0 && estimatedGrowth<0.05){
		    tags['circumference:growth:estimated']=Math.round(1000.0*estimatedGrowth)/10.0;
		    
		    let estimatedAge = letzter.circumference / estimatedGrowth;
		    let esd = Math.round( decimalYear(letzter.timestamp)-estimatedAge);
		    //if(esd=='NaN')stderr(esd);
		    tags['start_date:estimated']=esd.toString();
		}
	    }
	}

	// start_date:calculated
	if(dim.length>=1){
	    let letzter=dim[dim.length-1];
	    //stderr(letzter);
	    let circumference = letzter.circumference;
	    if(circumference>5.0)circumference=circumference/100.0
	    let timestamp = letzter.timestamp;

	    let propagation;
	    if(tags.propagation){
		propagation=tags.propagation
	    }else{
		propagation='unknown'
	    }
	    let growth;
	    switch(propagation){
	    case 'natural':
	    case 'sucker':
	    case 'cutting':
		growth = 0.008;
		break;
	    default:
		growth = 0.014;
		break;
	    }
	    let alter=circumference/growth;
	    let years=decimalYear(timestamp);
	    let sy = Math.round(years-alter);

	    if(sy>1600)tags['start_date:calculated']=sy.toString();
	}   

	// height:growth ,  height:growth:estimated
	dim = getChanges(diffs, ["height"]);
	if(dim.length>=2){
	    let erster = dim[0];
	    let letzter = dim[dim.length-1];
	    let startDate=erster.timestamp;
	    let dauer = decimalYear(letzter.timestamp)-decimalYear(erster.timestamp);
	    let zuwachs = letzter.height - erster.height;
	    let relativeZuwachs= zuwachs / letzter.height;
	    if( relativeZuwachs>0.1 || dauer > 1.0 ){
		let estimatedGrowth=Math.round( (10.0*zuwachs)/dauer )/10.0;
		if(estimatedGrowth<2.0&&estimatedGrowth>0.0)tags['height:growth']=estimatedGrowth;
	    }
	}else if(tags.start_date && dim.length>=1){
	    let letzter = dim[dim.length-1];
	    let dauer = ( decimalYear(letzter.timestamp)-decimalYear(tags.start_date) ) +2.0;
	    let zuwachs = letzter.height;
	    let growth= zuwachs/dauer;
	    tags['height:growth:estimated']=Math.round( (10.0*growth ))/10.0;
	}

	// latest_update
	dim = getChanges(diffs,['circumference','height']);
	if(dim.length>=1){
	    let latestUpdate= dim[dim.length-1].timestamp;
	    tags['latest_update']=latestUpdate;
	}
    }else{
	//stderr("5")
    }
}



function processGeojson(geoIn){

    let features= geoIn.features;
    for(let i=0;i<features.length;i++){
	let feature=features[i];
        addGrowth(feature)   
    }

    process.stdout.write(JSON.stringify(geoIn ,null,2)+'\n');	    
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
