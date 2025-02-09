#!/usr/bin/env node

const fs = require('fs');                                                                                                   

function read(name){                                                                                                        
    return fs.readFileSync(name,{encoding:'utf8', flag:'r'});                                                               
}                                                                                                                           
function write(name,data){                                                                                                  
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});                                                                
}                                                                                                                           


function processGeojson(geoIn){

    let prefix="https://speierling.arglos.ch/node/"
    let mediaOut;
    for(const [key,value] of Object.entries(geoIn)) {
        let mediaOutFile=outPath+"/"+key+"/media.json"
        mediaOut= { type: "mediaCollection", pictures: [], videos: [], documents: [] }
        value.forEach( (file) => { 
                                    let medium= {}
                                    medium.picture=prefix+key+"/"+file;
                                    medium.thumb=prefix+key+"/thumbs/"+file;
                                    //medium.caption="";
                                    mediaOut.pictures.push(medium);
                                 });
        write(mediaOutFile,JSON.stringify(mediaOut,null,2)+'\n');
        //process.stdout.write(mediaOutFile+"\n"+JSON.stringify(mediaOut,null,2)+'\n\n');
        //console.log(`${mediaOutFile}: ${mediaOut}`);
    }

    process.stdout.write(JSON.stringify(geoIn,null,2));
    //
}


let outPath=process.argv[2];

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
                                                                                                                            
const { execSync } = require('child_process');                                                                              
function shell(command){                                                                                                    
    //console.log(args);                                                                                                    
    let opts= { encoding: 'utf8' };                                                                                         
    return execSync(command,[], opts);                                                                                      
}                                                                                                                           
*/

