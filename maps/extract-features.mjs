#!/usr/bin/env node


import { Jimp } from "jimp";
import { promises as fs } from "fs";
import { existsSync, readSync } from "fs"
import { intToRGBA } from "@jimp/utils";


const layerDefs = {
    osm: {
	template: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	name: 'osm',
	ext: 'png'
    },
    esri: {
	template: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
	name: 'esri',
	ext: 'jpeg'
    },
    swisslaub: {
	template: 'https://wmts.geo.admin.ch/1.0.0/ch.bafu.landesforstinventar-waldmischungsgrad/default/current/3857/{z}/{x}/{y}.png',
	name: 'laub',
	ext: 'png'
    },
    swisswald: {
	template: 'https://wmts.geo.admin.ch/1.0.0/ch.bafu.ren-wald/default/current/3857/{z}/{x}/{y}.png',
	name: 'wald',
	ext: 'png'
    },
    swissraum: {
	template: 'https://wmts.geo.admin.ch/1.0.0/ch.bafu.lebensraumkarte-schweiz/default/current/3857/{z}/{x}/{y}.png',
	name: 'raum',
	ext: 'png'
    },
    swisshoehe: {
	template: 'https://wmts.geo.admin.ch/1.0.0/ch.bafu.landesforstinventar-vegetationshoehenmodell/default/current/3857/{z}/{x}/{y}.png',
	name: 'hoehe',
	ext: 'png'
    },
    swissslope: {
	template: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.hangneigung-ueber_30/default/current/3857/{z}/{x}/{y}.png',
	name: 'slope',
	ext: 'png'
    },
    swisshang: {
	template: 'https://wmts.geo.admin.ch/1.0.0/ch.blw.hang_steillagen/default/current/3857/{z}/{x}/{y}.png',
	name: 'hang',
	ext: 'png'
    }
}

function rgbaToHex(red, green, blue, alpha) {
    const rgba = (red << 24) | (green << 16) | (blue << 8) | (alpha <<0) ;
  return '#' + (0x100000000 + rgba).toString(16).slice(1);
}

function intToHex(color){
   return '#' + (0x100000000 + color).toString(16).slice(1);
}

function sampleColor(image,x,y,w,h){

    let r=0;
    let g=0;
    let b=0;
    let a=0;
    let c = 0;

    let obj={};
    //const data = image.bitmap;
    
    image.scan(x,y,w,h, (x,y,idx) => {
        
	let col= image.getPixelColor(x,y);
	let cols=col.toString();
	//process.stderr.write(cols+' ');
	if(!obj[cols]){
	    obj[cols]=0
	}else{
	    obj[cols]=obj[cols]+1;
	}
	let co = intToRGBA(col);
	c++;
	let R=co.r;
	let G=co.g
	let B=co.b
	let A=co.a
	r+=R;
	g+=G
	b+=B;
	a+=A;

    });

    r/=c;
    g/=c;
    b/=c;
    a/=c;

    r=Math.round(r);
    g=Math.round(g);
    b=Math.round(b);
    a=Math.round(a);

    let max=-1;
    let res;
    process.stderr.write(JSON.stringify(obj,null,2));
    for(let [key,value] of Object.entries(obj)){
	if(value>max){
	    res=key
	    max=value
	}
    }

    
    res=Number(res);
    let co=intToRGBA(res);
    
    return { mean: [ r, g, b, a ] }
}


///////////////////////////////////////   end     /////////////////////////////////////

function processGeojson(geo){

    const width=512;
    const height=512;
    const zoom=17;
    
    const worldNames = ['osm', 'esri' ];
    //const swisslayers = [ 'swisslaub', 'swisswald', 'swisshoehe', 'swissraum', 'swissslope' ]
    const swissNames = [ 'swissraum', 'swisswald', 'swisshoehe',  'swisslaub', 'swisshang', 'swissslope' ];

    let names=swissNames;
    let out={};

    let features=geo.features;

    let count=0;
    for(let i=0;i<features.length;i++){
	const feature=features[i];
	const tags = feature.properties.tags;
        if(tags['addr:country']=='Schweiz/Suisse/Svizzera/Svizra')count++;
    }

    let size=16;
    let w= names.length*size;
    let h=count*size;
    
    //let big = new Jimp({ width: w, height: h });

    let layers={};
    for(let i=0;i<names.length;i++){
	layers[names[i]]=i*size;
    }
    out['layers']=layers;
	
    count=0;
    for(let i=0;i<features.length;i++){
	const feature=features[i];
	const id=feature.properties.id;
	const tags = feature.properties.tags;

	const posX=(width-size)/2
	const posY=(height-size)/2
	
        if(tags['addr:country']=='Schweiz/Suisse/Svizzera/Svizra'){
	    process.stderr.write('.');
	    for(let j=0;j<names.length;j++){
		let name=names[j];
		let layerDef= layerDefs[name];
		let layerName=layerDef.name;
		let nodepath=nodedir+id+'/';
		let nodefile= nodepath+layerName+'.png';
		/*
 		if(existsSync(nodefile)){
		    let image = await Jimp.read(nodefile);
		    let cropped=image.crop({ x:posX, y:posY, w:size, h:size });
		    big.composite(cropped,j*size,count*size);
		}
                */
	    }
	    out[id]=count*size;
	    count++;
	}
    }
    //big.write('big.png');

    process.stdout.write(JSON.stringify(out,null,2));
}


let nodedir;

if(!process.argv[2]){
    process.stderr.write('usage: make-maps-images.mjs <tilecachedir> <nodecachedir>\n');
    process.exit(1);
}else{
    nodedir=process.argv[2]
    if(!existsSync(nodedir)){
	process.stderr.write('error: "'+nodedir+'" not found\n');
	process.exit(1)
    }
    if(!nodedir.endsWith('/'))nodedir=nodedir+'/';
}

/*
let nodefile= nodedir+'1676933509/esri.png';
let image = await Jimp.read(nodefile);
let color = sampleColor(image, 250,250,12,12);
console.log(color)
process.exit(0);
*/

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


	    /*
            let layers={};	  
	    for(const name of names){
		let layerDef= layerDefs[name];
		let layerName=layerDef.name;
 		if(existsSync(nodefile)){
		    let image = await Jimp.read(nodefile);
		    //let color = sampleColor(image, 250,250,12,12);
		    let cropped=image.crop({ x:250, y:250, w:12, h:12 });
		    process.stderr.write('\n'+nodepath+layerName+'-12.png  '+image.mime+'\n');
		    await cropped.write(nodepath+layerName+'-12.png');
		    layers[layerName]=color;
		}
	    }
            */
