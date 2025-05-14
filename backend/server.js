import { serveFile, serveDir } from "jsr:@std/http";

function handler(){
    const headersCORS = new Headers();

    headersCORS.set("Access-Control-Allow-Origin", "*");
    headersCORS.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    headersCORS.set("Access-Control-Allow-Headers", "Content-Type");
    headersCORS.set("Content-Type", "application/json" );
    
}