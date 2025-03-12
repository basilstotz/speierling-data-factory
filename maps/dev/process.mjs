#!/usr/bin/env node


import { Jimp } from "jimp";
import { promises as fs } from "fs";
import { existsSync } from "fs"
import { intToRGBA, cssColorToHex, colorDiff } from "@jimp/utils";



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


function mean(image){
    let pix= image.pixelate(size);
    return pix.getPixelColor(size/2,size/2);
}

// https://www.geeksforgeeks.org/node-jimp-blit/

let vegetionshoehe = [
    { color: 0xFFFFFF, value: 0.0, name: 'White' },
    { color: 0xFFFEB3, value: 1.0, name: 'Creme' },
    { color: 0xFFFE70, value: 2.0, name: 'Pastel yellow' },
    { color: 0xEBFB4C, value: 3.0, name: 'Banana yellow' },
    { color: 0x96F649, value: 5.0, name: 'Kiwi green' },
    { color: 0x00EC45, value: 15.0, name: 'Bright light green' },
    { color: 0x00CB41, value: 20.0, name: 'Green' },
    { color: 0x00A08D, value: 30.0, name: 'Blue/green' },
    { color: 0x006A5D, value: 40.0, name: 'Blue green' }
];

let hanglagen = [
    { color: 0xFFFFFF, value: 0.0, name: 'White' },
    { color: 0xFFCACC, value: 18.0, name: 'Light rose' },
    { color: 0xDD6167, value: 35.0, name: 'Salmon pink' },
    { color: 0xA82B34, value: 50.0, name: 'Dull red' }
];

let wald = [
    { color: 0xFFFFFF, value: 0.0, text: 'kein Wald', name: 'White' },
    { color: 0x006F22, value: 1.0, text: 'Wald', name: 'Darkish green' },
    { color: 0x87C967, value: 1.0, text: 'Gebüschwald', name: 'Turtle green' },
    { color: 0x89B58A, value: 1.0, text: 'Wald offen', name: 'Greyish green' }
];


function paletteToRange(palette,rgbColor){

    let value
    let min=1.0;
    pallete.forEach( (item) => {
	let rgb=intToRGBA(item.color)
	let diff=colorDiff(rgbColor,rgb);
	if(diff<min){
	    min=diff;
	    value=item.value
	}   
    });

    return value
}


let size=16;

let big = await Jimp.read('big.png');
let width=big.width;
let height=big.height;

let big2 = new Jimp({ width: width, height: height });
//let empty = new Jimp({width: size, height: size, color: cssColorToHex('rgba(255,255,255,1.0}')});

let w=width/size;
//let h=Math.round(height/(50*size));
let h=height/size;


for(let i=0;i<w;i++){
    process.stderr.write('.');
    for(let j=0;j<h;j++){
	
	let x=i*size;
	let y=j*size;
        let out;
	//console.log(x,y);
        //cropped.blit({ src:empty, x:0, y:0 });
	let cropped= new Jimp({width: size, height: size, color: cssColorToHex('rgba(255,255,255,1.0}')});
	cropped.blit({ src:big, x:0, y:0, srcX:x, srcY:y, srcW:size, srcH:size });
	//let cropped = big.clone().crop({x: x, y: y, w:size, h: size});
	//let color= mean(cropped);
	//let n = new Jimp({ width: size, height: size, color: color });
	//let quant=cropped.quantize({ colors:8 });
        switch(i){
	case 0:
	case 1:
	    out=cropped.pixelate(size);
	    break;
	case 2:
	case 3:
	case 4:
	case 5:
	    out=cropped.pixelate(size)  //.greyscale();
	    break;

	}
	
	big2.composite(out,x,y);

    }
}

await big2.write('big2.png');


