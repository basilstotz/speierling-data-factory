//const OSM = require("osm-api");
// or
import * as OSM from "osm-api";

//https://openstreetmap.org/node/6598972267

// you can call methods that don't require authentication
let ans = await OSM.getFeature("node",6598972267 );
console.log(JSON.stringify(ans,null,2));

OSM.configure({ basicAuth: { username: "bstotz", password: "Herakles0815" } });
// Once you login, you can call methods that require authentication.
// See the section below about authentication.
//await OSM.createChangesetComment(114733070, "Thanks for your edit!");


if(OSM.isLoggedIn()){console.log("ja1")}else{console.log("nein1")}


//let ans2= await OSM.getPreferences();

//console.log(JSON.stringify(ans2,null,2));



//if(OSM.isLoggedIn()){console.log("ja2")}else{console.log("nein2")}
