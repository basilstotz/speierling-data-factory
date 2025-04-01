#!/usr/bin/env node

import {Jimp} from 'jimp';
import { existsSync,mkdirSync } from 'node:fs';
import { SphericalMercator } from '@mapbox/sphericalmercator';
import pkg from 'srtm-elevation';
const { TileSet } = pkg;
//import pkg2 from 'xyz-affair';
//const xyz = pkg2
//import * as viewport from '@mapbox/geo-viewport'

//import * as tilebelt from '@mapbox/tilebelt';
//import * as utils from './map-utils.mjs';
//import { TileSet } from 'srtm-elevation';

let tilesetter;
var  Image;
let lastEle=400;


export class HGTDem  {

    constructor(tileDir,options){
	tilesetter= new TileSet(tileDir,options)
	this.merc = new SphericalMercator({
	    size: 256,
	    antimeridian: true
	});
	this.ax =
	    [ 1, 0, -1,
	      2, 0, -2,
	      1, 0, -1
	    ];
	this.ay =
	    [ -1, -2, -1,
	       0,  0,  0,
	       1,  2,  1
	    ];

    }

    getElevation(lat, lon, options={}){
	return new Promise( function(resolve, reject){
            tilesetter.getElevation( [lat,lon] , function(err, elevation){
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
	let dzdx =0.0;
	for(let i=0;i<H.length;i++){
	    dzdx+=this.ax[i]*H[i];
	}
	let dzdy =0.0;
	for(let i=0;i<H.length;i++){
	    dzdy+=this.ay[i]*H[i];
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
//process.stderr.write(leftTile+' '+rightTile+' '+bottomTile+' '+topTile+' '+zoom+'\n');
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
//process.stderr.write('n '+nnx+' '+nny+'\n');
	const image= new Jimp({width: nnx, height: nny, color: 0xff0000ff });
//console.log(zoom,nnx,nny,delta*256);
	//const dx=Dx/nx;
	//const dy=Dy/ny;
	for(let i=0;i<nnx;i++){
	    for(let j=0;j<nny;j++){
		let x=leftTile+i*delta;
		let y=topTile+j*delta;
		/*
		let lon=utils.tile2long(x,zoom);
		let lat=utils.tile2lat(y,zoom);
                */
		let [ lon,lat ] =this.merc.ll([ x*256, y*256 ],zoom);
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
	const bottom=bbox.south;
	const top=bbox.north;
	const left=bbox.west;
	const right=bbox.east;
	const [ leftTile,topTile ] = this.merc.px([left,top],zoom);
	const [ rightTile,bottomTile ] = this.merc.px([right,bottom],zoom);
	
//process.stderr.write(leftTile+' '+rightTile+'    *****    '+bottomTile+' '+topTile+'\n');
	let image = await this.makeImageMercator(leftTile/256,rightTile/256,bottomTile/256,topTile/256,zoom,border);
	return image;
    }

    async getImageFromViewport(bounds,zoom,dimensions){
 	let bbox = viewport.viewport(bounds,zoom, dimensions);
        return await this.makeImage( {
	    west: bbox[0],
	    south: bbox[1],
	    east: bbox[2],
	    north: bbox[3]
	},zoom,false);
    }

    existsTile(x,y,z,path){
	if(!path.endsWith('/'))path=path+'/';
	let spath=path+z+'/'+x+'/'+y+'.png';
	return existsSync(spath)
    }
    
    async makeTilesFromBBOX(bbox,zoom,path){
        const south = bbox.south;
        const north = bbox.north;
        const west = bbox.west;
        const east = bbox.east;
        let tiles = xyz( [ [west,south], [east,north] ],zoom);
        for( let tile of tiles){
	    if(!this.existsTile(tile.x, tile.y, tile.z,path)){
		await this.makeTile( tile.x, tile.y, tile.z);
		await this.writeTile(path)
	    }
        }
    }

    async makeTileOnPos(lon,lat,zoom,path){
	let xy=this.merc.px( [ lon, lat ],zoom )
	let x= Math.floor(xy[0]/256);
	let y= Math.floor(xy[1]/256);
	if(!this.existsTile(x,y,zoom,path)){
	    await this.makeTile(x,y,zoom);
	    await this.writeTile(path)
	}
    }
    
    async makeTile(x,y,z){
	this.x=x;
	this.y=y;
	this.z=z;
	let tile = await this.makeImageMercator(x,x+1,y+1,y,z,false)
	return tile;
    }

    async writeTile(tileDir){
	process.stderr.write('.');
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


