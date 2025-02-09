#!/usr/bin/env node

let geoIn;

function callback(antwort){

   let elements=JSON.parse(antwort).elements
   console.log(elements)
}
   

function httpGet(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


const doit =	(feature) => {  let url="https://api.openstreetmap.org/api/0.6/"+feature.id+"/?format=json"
 console.log(url);
                        fetch(url)
                            .then(response => {
                                    if (!response.ok) {
                                         throw new Error('Network response was not ok');
                                    }
                                    return response.json();
                             })
                             .then(data => {
                                    console.log(data);
                                    })
                             .catch(error => {
                                    console.error('There has been a problem with your fetch operation:', error);
                                   });
                      }
   


function processGeojson(geoIn){

    var geoOut={ type: "FeatureCollection", features: [] };

    for(let i=0;i<3;i++)doit(geoIn.features[i]);   

    //process.stdout.write(JSON.stringify(geoOut,null,2)+'\n');	    
}

var chunks = '';

process.stdin.on('readable', () => {
  let chunk;
  while (null !== (chunk = process.stdin.read())) {
      chunks+=chunk;
  }
});

process.stdin.on('end', () => {
    geoIn=JSON.parse(chunks);
    processGeojson(geoIn)
});


/*
const fs = require('fs');
function read(name){
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});
}
function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}

const { execSync } = require('child_process');
function shell(command){
    //console.log(args);
    let opts= { encoding: 'utf8' };
    return execSync(command,[], opts);
}
*/
