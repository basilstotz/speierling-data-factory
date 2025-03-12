#!/usr/bin/env node

import { existsSync,mkdirSync } from 'node:fs';

import { SphericalMercator } from '@mapbox/sphericalmercator';
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
	this.merc = new SphericalMercator({
	    size: 256,
	    antimeridian: true
	});
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


    async getSlope(lat,lon,delta=1){

	let [ x,y ] = this.merc.px([lon,lat],12);
	const top = y - delta;
	const left = x - delta;
//console.log(left,top,delta);

	let H = [];
	for(let i=0;i<3;i++){
	    for(let j=0;j<3;j++){
		let px=left+j*delta;
		let py=top+i*delta;
		let [ lon,lat] = this.merc.ll([px,py],12)
		try {
		    let ele = await this.getElevation(lat,lon)
//console.log(lat,lon);
		    H.push(ele);
		} catch {
		    console.log('error')
		}
	    }
	}
	const ax =
	    [ 1, 0, -1,
	      2, 0, -2,
	      1, 0, -1
	    ];
	const ay =
	    [ -1, -2, -1,
	       0,  0,  0,
	       1,  2,  1
	    ];
	let dzdx =0.0;
	for(let i=0;i<H.length;i++){
	    dzdx+=ax[i]*H[i];
	}
	let dzdy =0.0;
	for(let i=0;i<H.length;i++){
	    dzdy+=ay[i]*H[i];
	}
	const zFactor=1.0/(2*delta*45)
	dzdx= dzdx/(2*delta);
	dzdy= dzdy/(2*delta);

	const d2=zFactor*Math.sqrt( dzdx*dzdx + dzdy*dzdy)
	const slope=d2;
	const aspect =  Math.atan2( dzdy, dzdx );
	
	let ans = { ele: H[4], slope: slope, aspect: aspect };
	return ans;
    }
    
    //stimmt 
    elevationToColor(ele){
	let val=Math.round((ele+10000)*10)
	return (val<<8)+0xff;
    }
    
    elevationToColor2(ele){
	const rs=256*256*256;
	const gs=256*256
	const bs=256;
	ele = Math.round((ele+10000)*10)
	let red=Math.round(ele/rs);
	let rest=ele-red*rs;
	let green=Math.round(rest/gs);
	let blue=Math.round(rest-green*gs);
	console.log(ele,red,green,blue)
	let ans= (red*rs+green*gs+blue*bs+255) //& 0xffffffff
	//if(ans<0)ans=0x000000ff;
	return ans;
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
		let ele = await this.getElevation(lat,lon);
		if(ele>0){
		    lastEle=ele
		}else{
		    ele=lastEle
		}
//process.stderr.write(ele+' ')
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


