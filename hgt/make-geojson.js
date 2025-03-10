#!/usr/bin/env node
const punycode = require('node:punycode');
const SyncTileSet = require('srtm-elevation').SyncTileSet;
const TileSet = require('srtm-elevation').TileSet;


function toRadians(grad){
    return grad*(Math.PI/180);
}

/*
// From Madrid to Paris [ latitude, longitude ]
const locations = [
  [ 40.396764305572056, -3.7408447265625004  ],
  [ 44.465151013519645,  2.2467041015625004  ],
  [ 43.23319741022136 , -2.9278564453125     ],
  [ 43.337164854911094, -1.4337158203125     ],
  [ 44.84418558537004 , -0.6207275390625001  ],
  [ 46.5739667965278  ,  0.36254882812500006 ],
  [ 47.87214396888731 ,  1.9006347656250002  ],
  [ 48.850258199721495,  2.3291015625000004  ], 
    [ 45.7769477403,10.4427014502],
    [ 47.8308275417,6.02260949059]
];
*/
// Calculate bounds (min and max values from lats/lngs)

// https://stackoverflow.com/questions/22519784/how-do-i-convert-an-existing-callback-api-to-promises
function getElevationPromise(tileset,lat,lon){
    return new Promise( function(resolve,reject){
	tileset.getElevation( [lat,lon] , function(err,elevation){
	    if(err){
		reject(err)
	    }else{
		resolve(elevation)
	    }
	});
    });
}


let out={ type: 'FeatureCollection', features: [] };
let tileset;

async function calc(geo){
    tileset= new TileSet('./data1');
    const factor = 0.00005;
    const features=geo.features;
    for(let i=0;i<features.length;i++){
        const feature=features[i];
        const id=feature.id;
        const tags=feature.properties.tags;
        const coordinates=feature.geometry.coordinates;
        //if(tags['addr:country']=='Schweiz/Suisse/Svizzera/Svizra'){
        const lat=coordinates[1];
        const lon=coordinates[0];
	//process.stderr.write('lat='+lat+' lon='+lon+'\n');
	
        //let s=getSlopeLatLng(lat,lon);
	//let s= { ele: 15, slpoe: 30, aspect: 10 }
	let s= await getElevationPromise(tileset,lat,lon);
	let ele=s.ele;
	let slope=s.slope;
	let aspect=s.aspect;
	let asp=toRadians(aspect);

	if(ele<0){
	    ele=0;
	    slope=0;
	    asp=0;
	}
	
	let dy= 1.0*Math.sin(asp)*slope*factor;
	let dx= Math.cos(asp)*slope*factor;

	let lat2=lat+dy;
	let lon2=lon+dx;

	let item={ "type": "Feature",
		   "properties": { id: id, ele: ele, slope: slope, aspect: aspect },
		   "geometry": {
		       "type": "LineString",
		       "coordinates": [ coordinates, [ lon2, lat2 ]   ]
		   }
		 };

	out.features.push(item);
            
    }
}


function preloadTileset(geo){
    const locations=[];
    const features=geo.features;
    for(let i=0;i<features.length;i++){
	const feature=features[i];
	const coordinates=feature.geometry.coordinates;
	locations.push( [ coordinates[1], coordinates[0] ] );
    }
    const lats = locations.map(l => l[0]);
    const lngs = locations.map(l => l[1]);
    const minLat = Math.min.apply(null, lats);
    const maxLat = Math.max.apply(null, lats);
    const minLng = Math.min.apply(null, lngs);
    const maxLng = Math.max.apply(null, lngs);

    const tileset = new SyncTileSet('./data3', [minLat, minLng], [maxLat, maxLng], function(err) {
	if (err) {
	    console.log(err);
	    return;    
	}
    });

}


var chunks = '';
let geo;

process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});

async function doit(geo){
    //preloadTileset(geo);
    await calc(geo)
    process.stdout.write(JSON.stringify(out,null,2));
}

process.stdin.on('end', () => {
    geo=JSON.parse(chunks);
    doit(geo);
});
