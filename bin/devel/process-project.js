#!/usr/bin/env node

const fs = require('fs');
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}


/////////////////////////    import from beautify   //////////////////////////////////

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


function beautifyFeature(feature){

        
    let tags=feature.properties.tags;

    /*
    // add elevation 
    if(feature.geometry.coordinates[2]){
	tags.ele=Math.round(feature.geometry.coordinates[2]);
    }
    */
    
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
	    if(decimalYear(tags.start_date)>=2020.0)tags['speierlingproject:neupflanzung']='yes'
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
		    let tag="speierlingproject:"+key.toLowerCase().replace("-","_");
		    tags[tag]=value;	
		}
	    }
	});	
    }

    if(!tags['speierlingproject:gebiet'] && tags['addr:gebiet']){
	tags['speierlingproject:gebiet']=tags['addr:gebiet']
    }
        
    return feature
}

function checkProject(geoIn){
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
}

    
function beautify(geojson){

    geojson.features.forEach( (feature) => { feature=beautifyFeature(feature); } );

    return geojson;   
}



////////////////////////////////////////////////////////////////////////////////////7

function addProject(geo){

    
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
    return geo
}

// this is bad code and does nomore work and does not belong here. Where?
function sort(geo){

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
    return geodata
}


function processProject(geodata){

    addProject(geodata);
    checkProject(geodata);
    beautify(geodata);

    //let out = sort(geodata);
    let out = geodata;
    
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
    processProject(JSON.parse(chunks))
});


