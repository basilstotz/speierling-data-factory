#!/usr/bin/env node



function slope(data,ncols,x,y){

    /* on image data
    function H(idx){
	const i=4*idx:
	return (data[i+0]*256+data[i+1])/10.0
    }
    */

    function H(idx){
	return data[idx]
    }
    
    let slope;
    let aspect;

    let zFactor=1.0/25.0

    let r=ncols;
    let i=y*ncols+x

    let H11 = H(i-r-1);
    let H12 = H(i-r);
    let H13 = H(i-r+1);
    let H21 = H(i-1)
    let H22 = H(i);
    let H23 = H(i+1);
    let H31 = H(i+r-1);
    let H32 = H(i+r);
    let H33 = H(i+r+1);

    let dzdy = ( H11 + 2*H12 + H13 - H31 - 2*H32 - H33 ) / 8.0
    let dzdx = ( H11 + 2*H21 + H31 - H13 - 2*H23 - H33 ) / 8.0
     //console.log(N+' '+S+' '+E+' '+W);

    let dx=2*disp;
    let dy=2*disp;

    dzdx= dzdx/dx;
    dzdy= dzdy/dy;

    let d2=zFactor*Math.sqrt( dzdx*dzdx + dzdy*dzdy)

    //if(d2>0)console.log(d2+' '+dzdy+' '+dzdx);

    slope=Math.atan(d2);
    aspect =  Math.atan2( dzdy, dzdx );

    return { ele: H22, slope: slope, aspect: aspect }
}


/*
function makeSlope(){
    let disp=1;
    for(let x=disp;x<ncols-disp;x++){
        //process.stderr.write('.');
        for(let y=disp;y<nrows-disp;y++){

	    
                      
            setSlope(slope,aspect,x,y);
        }       
    }
}
*/
