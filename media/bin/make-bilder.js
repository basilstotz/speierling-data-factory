#!/bin/env node

const fs = require('node:fs');

let out = {};
let path; 

let exts= [ 'jpg','jpeg','png'];

if(process.argv[2]){
    let dir= process.argv[2];
    if(!fs.existsSync(dir)){
	process.stderr.write('error: directory "'+dir+'" does not exist\n');
        process.exit(1)
    }else{
        let ende='';
        if(!dir.endsWith('/'))ende='/';
        path=dir+ende;
    }
}else{
    process.stderr.write('usage: make-bilder.js <bilderDir>\n')
    process.exit(1);
}

//let path='./../../../node/';



function write(name,data){
    fs.writeFileSync(name,data,{encoding:'utf8', flag:'w'});
}

function writeMediaFile(mediaDir,nodeId,bildArray){ 

    let prefix="https://speierling.arglos.ch/node/"
    let mediaOutFile=mediaDir+"/media.json";
    let mediaOut= { type: "mediaCollection", pictures: [], videos: [], documents: [] }
    bildArray.forEach( (file) => {
                                let medium= {}
        medium.picture=prefix+nodeId+"/"+file;
                                medium.thumb=prefix+nodeId+"/thumbs/"+file;
                                //medium.caption="";
                                mediaOut.pictures.push(medium);
    });
    
    write(mediaOutFile,JSON.stringify(mediaOut,null,2)+'\n');
    //process.stdout.write(mediaOutFile+"\n"+JSON.stringify(mediaOut,null,2)+'\n\n');
    //console.log(`${mediaOutFile}: ${mediaOut}`);
    return mediaOut;
}


fs.readdirSync(path)
    .map(fileName => {
        let fn=path+fileName;
	if(fs.lstatSync(fn).isDirectory()){
//console.log(fileName);
            let mediaOutDir=fn;
            let id=fileName;
            out[id]=[];
	    fs.readdirSync(fn)
		.map( fileName => {
                    //console.log(fileName);
                    let fnn=fn+'/'+fileName;
                    if(fs.lstatSync(fnn).isFile()){
			let fnna=fnn.split('/');
                        let file=fnna[fnna.length-1]
//console.log(file);
                        let fa=file.split('.');
                        let ext;
                        if(fa[1]){
			    ext=fa[1].toLowerCase();
                            if(exts.includes(ext))out[id].push(file);
                        }			
                    }
		    
		})
            let media = writeMediaFile(mediaOutDir,id,out[id]);
            out[id]= media;         
        }
    })


process.stdout.write(JSON.stringify(out,null,2));
