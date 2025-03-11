#!/usr/bin/env node

import { existsSync,mkdirSync } from 'node:fs';

//import { SphericalMercator } from '@mapbox/sphericalmercator';
import * as utils from './map-utils.mjs';

//import { TileSet } from 'srtm-elevation';
import pkg from 'srtm-elevation';
const { TileSet } = pkg;



import {Jimp} from 'jimp';
//import * as tilebelt from '@mapbox/tilebelt';

let tileset;
var  Image;
let lastEle=400;

export class HGTDem  {

    constructor(tileDir,options){
	tileset= new TileSet(tileDir,options)
    }

    getElevation(lat, lon, options={}){
	return new Promise( function(resolve, reject){
            tileset.getElevation( [lat,lon] , function(err, elevation){
		if(err){
                    reject(err)
		}else{
                    resolve(elevation)
		}
            }, options);
	});
    }

    getSlope(lat,lon){
    }
    
    //stimmt nicht
    elevationToColor2(ele){
	ele*=10;
	let val=Math.round((ele+10000)*10)
	return (val<<8)+0xff;
    }
    
    elevationToColor(ele){
	const rs=256*256*256;
	const gs=256*256
	const bs=256;
	ele*=10;
	let red=Math.round(ele/rs);
	let rest=ele-red*rs;
	let green=Math.round(rest/gs);
	let blue=Math.round(rest-green*gs);
	return 10*(red*rs+green*gs+blue*bs+255)
    }
    
    async makeImageMercator(leftTile,rightTile,bottomTile,topTile,zoom,border){

	//in tiles units
	const Dx=rightTile-leftTile
	const Dy=bottomTile-topTile;  
//console.log(Dx,Dy);
	
	let nx,ny;
	let delta = 1.0/256.0;;
	if(Math.round(zoom)>=12){
	    delta*=Math.pow(2,zoom-12)
	    nx=Math.round(Dx/delta)
	    ny=Math.round(Dy/delta);
	}else{
	    nx=Math.round(Dx*256);
	    ny=Math.round(Dy*256);
	}
    
	let nnx,nny;
	if(border){
	    nnx=nx+1;
	    nny=ny+1;
	}else{
	    nnx=nx;
	    nny=ny;
	}
//console.log('n ',nnx,nny);
	const image= new Jimp({width: nnx, height: nny, color: 0xff0000ff });
//console.log(zoom,nnx,nny,delta*256);
	//const dx=Dx/nx;
	//const dy=Dy/ny;
	for(let i=0;i<nnx;i++){
	    for(let j=0;j<nny;j++){
		let x=leftTile+i*delta;                         // war dx;
		let y=topTile+j*delta;                          // war dy;
		let lon=utils.tile2long(x,zoom);
		let lat=utils.tile2lat(y,zoom);
		let ans = await this.getElevation(lat,lon);
		let ele=ans.ele;
		if(ele>0){
		    lastEle=ele
		}else{
		    ele=lastEle
		}
		//console.log(ans)
		let color=this.elevationToColor(ele); 
		image.setPixelColor(color, i,j);
		//console.log(color,i,j)
	    }
	}
	Image = image;
	return image;
    }

    async makeImage(bbox,zoom,border=true){

	//wgs84
	const bottom=bbox.south;
	const top=bbox.north;
	const left=bbox.west;
	const right=bbox.east;
	//webmercator
	const leftTile=utils.lon2tileFraction(left,zoom);
	const rightTile=utils.lon2tileFraction(right,zoom);
	const bottomTile=utils.lat2tileFraction(bottom,zoom);
	const topTile=utils.lat2tileFraction(top,zoom);

//console.log(leftTile,rightTile,'             ',bottomTile,topTile);
	let image = await this.makeImageMercator(leftTile,rightTile,bottomTile,topTile,zoom,border);
	return image;
    }
    
    async makeTile(x,y,z){
	this.x=x;
	this.y=y;
	this.z=z;
	let tile = await this.makeImageMercator(x,x+1,y+1,y,z,false)
	return tile;
    }

    async writeTile(tileDir){
	//console.log(this.mage);
	if(!tileDir.endsWith('/'))tileDir=tileDir+'/';
	let path=tileDir+this.z+'/'+this.x+'/';
	if(!existsSync(path))mkdirSync(path,{recursive:true});
	path=path+this.y+'.png';
	await Image.write(path);
    }
    
    async writeImage(path){
	await Image.write(path)
    }
} //class


