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

function beautifyFeature(feature){

        
    let tags=feature.properties.tags;

    // add elevation 
    if(feature.geometry.coordinates[2]){
	tags.ele=Math.round(feature.geometry.coordinates[2]);
    }

    // should "media_collection" not "media"
    if(feature.properties.pictures_url_prefix){
	tags.media=feature.properties.pictures_url_prefix+"media.json"
	tags["media_collection"]=feature.properties.pictures_url_prefix+"media.json"
    }

    if(feature.properties.pictures){
	tags["meta:media_size"]=feature.properties.pictures.length;
    }

    
    // process data from projekt
    if(feature.properties.project){
	
	let project=feature.properties.project;

	// project marker
	tags["speierlingproject"]="yes";
	
	// add project missing daten to tags
	if(!tags.circumference){
	    if(project.BHU && project.BHU!=""){
		// martin: BHU muss genau eine Zahl sein
		let bhu=martin(project.BHU);
		if(bhu+0==bhu){
		    tags.circumference=bhu/100.0;
		    process.stderr.write("https://openstreetmap.org/"+feature.id+"\tWarnung: Das Tag \"circumference="+tags.circumference+"\" fehlt. Wird von Editor hinzugefügt.\n")
		}
	    }
	}
	if(!tags.start_date){
	    if(project.Pflanzjahr&&project.Pflanzjahr!=""){
		// martin: Pflanzjahr muss genau eine Zahl sein
		let pflanzjahr=martin(project.Pflanzjahr);
		if(pflanzjahr+0==pflanzjahr){
		    tags.start_date=pflanzjahr;
		    process.stderr.write("https://openstreetmap.org/"+feature.id+"\tWarnung: Das Tag \"start_date="+tags.start_date+"\" fehlt. Wird vom Editor hinzugefügt.\n");
		}
	    }
	}


	
	/*
	propagation=[natural|sucker|planted|seed|graft]
	propagation:parent=[openstreetmap/node/xxxxxxxxxx|local|alien]
	propagation:variety=var1,var2,....
	propagation:rootstock=rootstock
	*/

	// propagation
	if(project.Vermehrungstyp && project.Vermehrungstyp!=""){

	    answer=martin(project.Vermehrungstyp);
	    if(answer=="unknown"){
		let dieser=feature.id;
		process.stderr.write("\tFehler: Der \"Vermehrungstyp\" in der Projektdatei vom Baum \""+dieser+"\" hat unbekannten Wert \""+answer+"\".\n");		
	    }
	    tags["propagation"]=answer;
	}
	
        // propagation:parent
	if(project.Herkunft!=""){
	    let herkunft=martin(project.Herkunft);
	    tags["propagation:parent"]=herkunft;
	}

	// mark neupflanzungen!!!
        if( (tags.propagation=='graft' || tags.propagation=='seed') && tags['propagation:parent'] && tags.start_date){
	    if(decimalYear(tags.start_date)>=2018.0)tags['speierlingproject:neupflanzung']='yes'
	}

	
        /* a sample project line 
        {
	"Node": 12264455828,                  // not needed  
	  "Check": "ja",                      // not needed
	  "Kanton": "Bratislavsky kray",      // not needed
	  "PLZ": "SK-900 01",                 // not needed 
	  "Ort": "Modra",                     // not needed
	  "Gebiet": "Modranské oskoruše-09",  // yet processed as "speierlingproject:gebiet"
	  "Vermehrungstyp": "N",              // yet processed as "propagation"
	  "Herkunft": "",                     // yet processed as "propagation:parent"
	  "Pflanzjahr": "",                   // maybe yet processed as "start_date"
	  "Lat-WGS84": 48.3413828,            // not needed
	  "Lon-WGS84": 17.3124869,            // not needed
	  "CHY-LV95": "",                     // not needed
	  "CHX-LV95": "",                     // not needed
	  "BHU": "",                          // maybe yet processed as "circumference"
	  "BHD": "",                          // not needed

          // only these !
	  "Datum": "September 2024",          
	  "Hauptinfo": "Steiner Roland",
	  "SEBA": "",
	  "Erhaltungs-Plantage_Biel_Nr": "",
	  "DNA_Probe": "",
	  "Fruechte": "",
	  "Verluste_Erklaerung": "",
	  "Reiser": "",
	  "Bemerkung": ""
	}

	*/


	// process project tags
	const allow = [
	    "Datum",
	    "Hauptinfo",
	    "SEBA",
	    "Erhaltungs-Plantage_Biel_Nr",
	    "DNA_Probe",
	    "Fruechte",
	    "Verluste_Erklaerung",
	    "Reiser",
	    "Bemerkung",
	    "Gebiet"
	];
        const projectArray=Object.entries(project);
	projectArray.forEach( ([key,val]) => {
	    if(val!=""){
		value=martin(val);
		if(allow.includes(key)){
		    let tag="speierlingproject:"+key.toLowerCase();    //.replace("-","_");
		    tags[tag]=value;	
		}
	    }
	});
	
    } // end if project
        
    // process nominatim 
    let address=feature.properties.nominatim.address;
    let addrArray=Object.entries(address);
    addrArray.forEach( ([key,value]) => {
	if(!( key=="postcode" || key.indexOf("ISO")!=-1) ){
	    let tag="addr:"+key;
	    tags[tag]=value;	
	}
    });
    if(feature.properties.nominatim.display_name){
	tags["addr:full"]=feature.properties.nominatim.display_name;
	tags["addr:gemeinde"]=feature.properties.nominatim.display_name.split(',')[0];
    }
    if(feature.properties.nominatim){ delete feature.properties.nominatim }

        
    // claenup
    if(feature.properties.relations){ delete feature.properties.relations }
   
    
    return feature
}


/// goes to karte.js
function repairTags(geojson){

    /////////////////////////////////////////
    /////     clean and update tags     /////
    /////////////////////////////////////////

    for(let i=0;i<geojson.features.length;i++){
	let tags=geojson.features[i].properties.tags;

	if(tags.planted_date&&!tags.start_date){
           tags.start_date=tags.planted_date;
	   //delete tags.planted_date;
        }
	//clean tags
	if(tags.start_date){
	    if(tags.start_date.toString().startsWith("~")){
		tags.start_date=tags.start_date.slice(1);
	    }
	    if(tags.start_date.toString().indexOf("-")!=-1){
		tags.start_date=tags.start_date.split("-")[0];
	    }
	}
	// circumference is in meters nit cm
	if(tags.circumference){
	    if(tags.circumference>10){
		//beautify.update.push("circumference");
		tags.circumference/=100.0;
	    }
	}
	
    }
    return geojson;
}

    
function beautify(geojson){

    geojson.features.forEach( (feature) => { feature=beautifyFeature(feature); } );

    return geojson;   
}


function processGeojson(geoIn){


    // check: if  "Herkunft" is not valid then set "Herkunft"=""
    // make indexed 
    let indexed={};
    for(let i=0;i<geoIn.features.length;i++){
	let feature=geoIn.features[i];
	indexed[feature.properties.id]=feature; 
    }
    for(let i=0;i<geoIn.features.length;i++){
	var feature=geoIn.features[i];
	if(feature.properties.project&&feature.properties.project.Herkunft&&feature.properties.project.Herkunft!=""){
            let parent=martin(feature.properties.project.Herkunft);
	    if(!indexed[parent]){
		feature.properties.project.Herkunft="";
		let dieser=feature.properties.id;
		process.stderr.write("Martin: Die \"Herkunft\" vom Baum \""+dieser+"\" mit dem Wert \""+parent+"\" existiert nicht. Diese Herkunft wird ignoriert.\n");
	    }
	}	
    }
    //end check
    	    
    let geoOut=repairTags(beautify(geoIn));

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
