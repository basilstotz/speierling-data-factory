#!/usr/bin/env node

import { Jimp } from 'jimp';
//import { promises as fs } from 'fs';
import { existsSync, writeFileSync, mkdirSync } from 'fs'
import * as utils from './map-utils.mjs'

export class XYZTileset{

    setOptions(options={}){
	if(options.template){
	    this.template=options.template;
	}else{
	    this.template='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	}
	if(options.cachedir){
	    this.cachedir=options.cachedir;
	}else{
	    if(this.cachedir){ delete this.cachedir }
	}
	this.tilesSpec=[];
    }


    constructor( options ){
	
	this.TILE_SIZE=256;
	this.setOptions(options);
	this.cache={};
    }

    async getTileFromURL(quadkey){
	let [x,y,z] = utils.quadkeyToTile(quadkey);
	let url =  this.template.replace('{s}','a').replace('{x}',x).replace('{y}',y).replace('{z}',z); 
	return await Jimp.read(url);
    }
    
    
    async getTile(quadkey){
	let [x,y,z] = utils.quadkeyToTile(quadkey);
	let tile;
	//let url =  this.template.replace('{s}','a').replace('{x}',x).replace('{y}',y).replace('{z}',z); 

	if(this.cachedir){
	    let path = this.cachedir+'/'+z+'/'+x+'/'+y;
	    if(!this.ext){
		if(existsSync(path+'.png')){
		    this.ext='png';
		}else if(existsSync(path+'.jpeg')){
		    this.ext='jpeg'
		}
	    }
	    if(this.ext && existsSync(path+'.'+this.ext)){
		process.stderr.write('-');
	      	tile = await Jimp.read(path+'.'+this.ext);
	    }else{
		process.stderr.write('+');
		tile = await this.getTileFromURL(quadkey);
		this.ext = tile.mime.slice(tile.mime.indexOf('/')+1)
		if(!existsSync(path.slice(0,path.lastIndexOf('/')))){
		    mkdirSync(path.slice(0,path.lastIndexOf('/')),{ recursive:true});
		}
		await tile.write(path+'.'+this.ext);
	    }
	}else{
	    tile= await this.getTileFromURL(quadkey);
	}
	return tile
    }

    async getTiles(bbox,zoom){
	
	let quads  = utils.bboxToQuads(bbox,zoom);
	let tiles=[];
        for(let quad of quads){
	    if(this.cache[quad]){
		process.stderr.write('*');
		tiles.push(this.cache[quad].tile)
	    }else{
		let tile= await this.getTile(quad);
		let now=Date.now();
		this.cache[quad]= { tile: tile, timestamp: now } 
		tiles.push(tile);
	    }
	}
	//garbabe collection
	let cacheArray= Object.entries(this.cache);
	if(cacheArray.length>500){
	    cacheArray.sort( (a,b) => { return b[1].timestamp - a[1].timestamp } );
	    process.stderr.write('garbage');
	    for(let i=0;i<250;i++){
		let [key,value] = cacheArray[i];
		delete this.cache[key]
	    }
	}
	return tiles
    }

    async getImage(bbox,zoom){

	let tileImages = await this.getTiles(bbox,zoom);
	let dimension= utils.bboxToDimension(bbox, zoom);
	let dimX = dimension.dimX;
	let dimY = dimension.dimY;
	let w = dimX*this.TILE_SIZE;
	let h = dimY*this.TILE_SIZE;
	this.image = new Jimp({ width: w, height: h });
	for(let y=0;y<dimY;y++){
	    for(let x=0;x<dimX;x++){
		let posX = x*this.TILE_SIZE;
		let posY = y*this.TILE_SIZE;
		let index = x+y*dimX;
		this.image.composite(tileImages[index],posX,posY);
	    }
	}
	let tilesBbox= utils.bboxToTileBbox(bbox,zoom)
        let pixelTopLeft = utils.latLonToPixel(bbox.north, bbox.west, tilesBbox, zoom);
        let pixelBottomRight = utils.latLonToPixel(bbox.south, bbox.east, tilesBbox, zoom);
	let xc = pixelTopLeft.x;
	let yc = pixelTopLeft.y;
	let wc = pixelBottomRight.x - pixelTopLeft.x;
	let hc = pixelBottomRight.y - pixelTopLeft.y;
	//console.log(xc,yc,wc,hc);
	this.image.crop({x: xc, y:yc, w:wc, h:hc});
	if(this.center){delete this.center}
	this.bbox = bbox;
	//console.log(this.bbox)
	return this.image
    }


    async getImageByPos(lat, lon, zoom, width, height){
        let bbox= utils.latLngToBounds(lat, lon, zoom, width, height)	
        let image = await this.getImage(bbox,zoom)
	this.center = { lat: lat, lon: lon };
	//console.log(this.bbox)
	return image;
    }

    getPixelPosition(lat,lon){
	//console.log(this.bbox);
	let pos = utils.latLonToPixel(lat, lon, this.bbox, this.zoom);
	if(pos.x>this.image.width)pos.x=this.image.width;
	if(pos.y>this.image.height)pos.y=this.image.height;
	return pos
    }
    
    async writeImage(path){
	if(this.image){
	    await this.image.write(path)
	}
    }
    
    getInfo(){
	let info = {
	    zoom: this.zoom,
	    bbox: this.bbox,
	    center: this.center,
	    template: this.template,
	    width: this.image.width,
	    height: this.image.height
	}
	return info;
    }

    async writeInfo(path){
	if(this.image){
	    let info=this.getInfo();
	    writeFileSync(path, JSON.stringify(info,null,2)+'\n','utf-8')
	}
    }
}
