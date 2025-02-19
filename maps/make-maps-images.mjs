#!/usr/bin/env node

/*
const { Jimp } = require('jimp');
const { execSync } = require('child_process');
const { promises as fs } = require('node:fs');
const { existsSync } = require('node:fs');


function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command, opts);
}
*/

import { Jimp } from "jimp";
import { promises as fs } from "fs";
import { existsSync } from "fs"




// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#lon.2Flat_to_tile_numbers_2

const EARTH_CIR_METERS = 40075016.686;
const TILE_SIZE = 256
const degreesPerMeter = 360 / EARTH_CIR_METERS;
const LIMIT_Y = toDegrees(Math.atan(Math.sinh(Math.PI))) // around 85.0511...

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
function toDegrees(radians) {
  return (radians / Math.PI) * 180
}

// coords to number  
function lon2tile(lon,zoom) {
    return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}

function lon2tileFraction(lon,zoom) {
    return (((lon+180)/360*Math.pow(2,zoom)));
}


function lat2tile(lat,zoom)  {
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}

function lat2tileFraction(lat,zoom)  {
    return (((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}



// number to coords
function tile2long(x,z) {
  return (x/Math.pow(2,z)*360-180);
}

function tile2lat(y,z) {
  const n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}


function lonOnTile(lon, zoom) {
  return ((lon + 180) / 360) * Math.pow(2, zoom)
}

function latOnTile(lat, zoom) {
  return (
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    Math.pow(2, zoom)
  )
}
 



function isBoundInSwitzerland(bbox){

    // https://gist.github.com/graydon/11198540

    let sLeft = 6.02260949059;
    let sRight = 10.4427014502;

    let sBottom =45.7769477403;
    let sTop = 47.8308275417;
    
    let top=bbox.north;
    let left=bbox.west;
    let bottom=bbox.south;
    let right=bbox.east;

    let switzerland= ((top < sTop) && (bottom > sBottom) && (left > sLeft) && (right < sRight));

    if(switzerland){
	return "true"
    }else{
	return "false"
    }
}



function bboxToTiles(bbox,zoom){
    
    let top=lat2tile(bbox.north,zoom);
    let left=lon2tile(bbox.west,zoom);
    let bottom=lat2tile(bbox.south,zoom);
    let right=lon2tile(bbox.east,zoom);

    //console.log('top='+top+' botton='+bottom+' left='+left+' right='+right);
    
    let tiles=[];

    // left to right
    // top to bottom
    
    for(let y=top;y<bottom+1;y++){
	for(let x=left;x<right+1;x++){
	    //tiles.push(zoom);
	    tiles.push(x);
	    tiles.push(y);
	}
    }

    return tiles;
}

function latLonToPixel(bbox, zoom){

    let top=lat2tile(bbox.north,zoom);
    let left=lon2tile(bbox.west,zoom);
    let bottom=lat2tile(bbox.south,zoom);
    let right=lon2tile(bbox.east,zoom);

    let lon=(bbox.west+bbox.east)/2.0;
    let lat=(bbox.north+bbox.south)/2.0;
    let fracX=lon2tileFraction(lon,zoom);
    let fracY=lat2tileFraction(lat,zoom);

    let px;
    let py;
    let resX;
    let resY;

    py=0;
    for(let y=top;y<bottom+1;y++){
	px=0;
	for(let x=left;x<right+1;x++){
	    let X=Math.floor(fracX);
	    let Y=Math.floor(fracY);
	    if(x==X && y==Y){
	  	resX=px+Math.round( (fracX-X)*TILE_SIZE );
		resY=py+Math.round( (fracY-Y)*TILE_SIZE );
            }
	    px+=TILE_SIZE;
	}
	py+=TILE_SIZE;
    }

    return { pixelX: resX, pixelY: resY }
}

function bboxToDimension(bbox,zoom){

    let top=lat2tile(bbox.north,zoom);
    let left=lon2tile(bbox.west,zoom);
    let bottom=lat2tile(bbox.south,zoom);
    let right=lon2tile(bbox.east,zoom);

    let dimX=Math.abs(left-right)+1;
    let dimY=Math.abs(top-bottom)+1;

    return { dimX: dimX, dimY: dimY }
}


////////////////////  public functions  //////////////////////////////////

function latLngToBounds(lat, lng, zoom, width, height){
    
  const metersPerPixelEW = EARTH_CIR_METERS / Math.pow(2, zoom + 8);

  const shiftMetersEW = width/2 * metersPerPixelEW;

  const shiftDegreesEW = shiftMetersEW * degreesPerMeter;
  
  const southTile = (TILE_SIZE * latOnTile(lat, zoom) + height/2) / TILE_SIZE
  const northTile = (TILE_SIZE * latOnTile(lat, zoom) - height/2) / TILE_SIZE

  return {
    south: Math.max(tile2lat(southTile, zoom), -LIMIT_Y),
    west: lng-shiftDegreesEW,
    north: Math.min(tile2lat(northTile, zoom), LIMIT_Y),
    east: lng+shiftDegreesEW
  }
}


function makeUrl(template, x, y, z){

    return template.replace('{x}',x).replace('{y}',y).replace('{z}',z).replace('{s}','a');
}

// swisstopo layers
// ch.bafu.landesforstinventar-waldmischungsgrad
// ch.bafu.ren-wald
// ch.bafu.lebensraumkarte-schweiz
// ch.bafu.landesforstinventar-vegetationshoehenmodell
// ch.swisstopo.hangneigung-ueber_30

// templates
// https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
// https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
// https://wmts.geo.admin.ch/1.0.0/{layer}/default/current/3857/{z}/{x}/{y}.png

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
    }
}

async function getLayer(tiledir,layerDef, bbox,zoom){

    let tiles = bboxToTiles(bbox,zoom);
    //let switzerland = isBoundInSwitzerland(bbox);
    let tileImages = [];

    //console.log(tiles.length)
    for(let i=0;i<tiles.length;i+=2){	
	let x=tiles[i];
	let y=tiles[i+1];
	let z=zoom;

	let url=makeUrl(layerDef.template,x,y,z);
	let ext=layerDef.ext;
	let layer=layerDef.name;
	/*
	switch(layer){
	case 'osm':
	    url='https://a.tile.openstreetmap.org/'+z+'/'+x+'/'+y+'.png';
	    ext='png';
	    break;
	case 'slope':
	    if(switzerland=='true' && zoom<=17){
		url='https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.hangneigung-ueber_30/default/current/3857/'+z+'/'+x+'/'+y+'.png';
	    }else{
		url='';
	    }
	    ext='png';
	    break;
	case 'esri':
	    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+z+'/'+y+'/'+x;
	    ext='jpeg';
	    break;
	default:
	    url=''
	    break;
	}
        */
	
	let path = tiledir+layer+'/'+z+'/'+x+'/';
	let file = y+'.'+ext;
	let tile;
	if(url!=''){
	    if(existsSync(path+file) ){ 
		tile = await Jimp.read(path+file)
	    }else{
		tile = await Jimp.read(url);
		console.log(path+file+' '+tile['mime']);
		await fs.mkdir(path, { recursive: true } );	    
		await tile.write(path+file);
	    }
	    tileImages.push(tile);
	}
    }
    return tileImages
}

async function makeImage(tiledir, layerDef, bbox, zoom, width, height){

    let pixel=latLonToPixel(bbox,zoom);

    let tileImages = await getLayer(tiledir, layerDef, bbox, zoom);

    //console.log(tileImages.length);

    if(tileImages.length>0){
	//console.log(tileImages);
	let dimension=bboxToDimension(bbox, zoom);
	let dimX = dimension.dimX;
	let dimY = dimension.dimY;
	// new image
	let w = dimX*TILE_SIZE;
	let h = dimY*TILE_SIZE;
	let out = new Jimp({ width: w, height: h });
	//compose tiles on image
	for(let y=0;y<dimY;y++){
	    for(let x=0;x<dimX;x++){
		let posX = x*TILE_SIZE;
		let posY = y*TILE_SIZE;
		let index = x+y*dimY;
		out.composite(tileImages[index],posX,posY);
	    }
	}
	//crop image
	let pixelX = pixel.pixelX;
	let pixelY = pixel.pixelY;
	let left = pixelX - width/2;
	let top = pixelY- height/2;
	if( (width==-1) && (height==-1) ){
	    return out
	}else{
	    let options = { x: left, y: top, w: width, h: height};
	    return out.crop(options);
	}
    }else{
	return false
    }	
}

///////////////////////////////////////   end     /////////////////////////////////////

async function processGeojson(geo){

    const width=512;
    const height=512;
    const zoom=17;
    
    const worldNames = ['osm', 'esri' ];
    //const swisslayers = [ 'swisslaub', 'swisswald', 'swisshoehe', 'swissraum', 'swissslope' ]
    const swissNames = [ 'swissslope', 'swissraum', 'swisshoehe', 'swisswald', 'swisslaub' ];
    
    let features=geo.features;
    for(let i=0;i<features.length;i++){
	const feature=features[i];
	const id=feature.properties.id;
	const tags = feature.properties.tags;
	const lat=feature.geometry.coordinates[1];
	const lon=feature.geometry.coordinates[0];

	let names;
        if(tags['addr:country']=='Schweiz/Suisse/Svizzera/Svizra'){
	    names=worldNames.concat(swissNames)
	}else{
	    names=worldNames
	}
	
	const bbox = latLngToBounds(lat, lon, zoom, width, height);

	for(const name of names){
	    let layerDef= layerDefs[name];
	    let layerName=layerDef.name;
	    let nodepath=nodedir+id+'/';
	    let nodefile= nodepath+layerName+'.png';
	    if(!existsSync(nodefile)){
		let image = await makeImage(tiledir, layerDef, bbox, zoom, width, height);
		if(image){
		    console.log(i+' '+nodefile);
		     await fs.mkdir(nodepath, { recursive: true } );
		    await image.write(nodefile);    
		}
	    }
	    if(layerName=='raum' && !existsSync(nodepath+layerName+'-768.png')){
		let image = await makeImage(tiledir, layerDef, bbox, zoom, -1, -1);
		if(image){
		    console.log(i+' '+nodepath+layerName+'-768.png');
		     await fs.mkdir(nodepath, { recursive: true } );
		    await image.write(nodepath+layerName+'-768.png');    
		}
	    }



	    
	}	
    }
}


let nodedir;
let tiledir;

if(!process.argv[3]){
    process.stderr.write('usage: make-maps-images.mjs <tilecachedir> <nodecachedir>\n');
    process.exit(1);
}else{
    nodedir=process.argv[3]
    if(!existsSync(nodedir)){
	process.stderr.write('error: "'+nodedir+'" not found\n');
	process.exit(1)
    }
    if(!nodedir.endsWith('/'))nodedir=nodedir+'/';
}

if(!process.argv[2]){
    process.stderr.write('usage: make-maps-images.mjs <tilecachedir> <nodecachedir>\n');
    process.exit(1);
}else{
    tiledir=process.argv[2]
    if(!existsSync(tiledir)){
	process.stderr.write('error: "'+tiledir+'" not found\n');
	process.exit(1)
    }
    if(!tiledir.endsWith('/'))tiledir=tiledir+'/';
}

if(process.argv[4] && process.argv[5]){
    let lat=Number(process.argv[4]);
    let lon=Number(process.argv[5]);
    let bbox=latLngToBounds(lat,lon,16,512,512);
    let image= await makeImage(tiledir, 'osm',bbox,16,512,512);
    await image.write('./out.png')
    process.exit(0);
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




/*
function downloadTiles(tiledir, bbox, zoom){

    let tiles=bboxToTiles(bbox,zoom);
    let switzerland=isBoundInSwitzerland(bbox);
    
    let command=process.cwd()+'/download-tiles.sh ';
    command+=' '+tiledir;
    command+=' '+switzerland;
    command+=' '+zoom;
    for( const item of tiles)command+=' '+item;
    //console.log(command);
    shell(command);

}

function makeImages(tiledir, id, lat, lon, bbox, zoom){

    let dimension=bboxToDimension(bbox, zoom);
    let tiles=bboxToTiles(bbox, zoom);
    let pixel=latLonToPixel(lat,lon,bbox,zoom);

    
    let command=process.cwd()+'/montage-tiles.sh ';
    command+=' '+tiledir;
    command+=' '+id;
    command+=' '+pixel.pixelX+' '+pixel.pixelY;
    command+=' '+dimension.dimX+' '+dimension.dimY;
    command+=' '+zoom;
    for( const item of tiles)command+=' '+item;
    
    //console.log(command);
    shell(command);

}

*/

/*
// 47.511748, 7.7814914
// 	47.4928344, 7.6411131

//exampls
const latitude =  47.4928344 //Number(process.argv[2])
const longitude = 7.6411131 //Number(process.argv[3])
const zoom = 17 //process.argv[4]
const width = 512 //process.argv[5]
const height = 512 //process.argv[5]

console.log(latitude,longitude);

const bbox = latLngToBounds(latitude,longitude,zoom,width,height);

//let tiles=bboxToTiles(bb,zoom);

downloadTiles('./tiles',bbox,zoom);

// https://stackoverflow.com/questions/2853334/glueing-tile-images-together-using-imagemagicks-montage-command-without-resizing
// montage tile*.jpg -tile 3x3 -geometry +0+0 output.jpg

makeImages('./tiles', latitude, longitude, bbox, zoom);
*/


/*
const src = [
  "https://www.openstreetmap.org/export/embed.html?bbox=",
  bb.west,
  ",",
  bb.south,
  ",",
  bb.east,
  ",",
  bb.north,
  "&layer=mapnik&marker=",
  latitude,
  ",",
  longitude,
].join('');


console.log(src);
*/
