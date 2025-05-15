import { serveFile, serveDir } from "jsr:@std/http";

async function handler(request){
    const url = new URL(request.url);
    const database = Deno.readTextFileSync("backend/database.json");
    const data = JSON.parse(database);
    const headersCORS = new Headers();

    headersCORS.set("Access-Control-Allow-Origin", "*");
    headersCORS.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    headersCORS.set("Access-Control-Allow-Headers", "Content-Type");
    headersCORS.set("Content-Type", "application/json" );

    if(request.method === "OPTIONS") { return new Response(null, {status: 204, headers: headersCORS}) };

    if(request.method === "GET"){
        if(url.pathname === "/"){
            // servar hemsidan
            return await serveFile(request, "frontend/public/index.html");
            return new Response(null, { status: 200, headers: headersCORS})
        }
    }
    if(request.method === "POST"){
        
    }
    return new Response(JSON.stringify(JSON.stringify("Bad Request")), { status: 400, headers: headersCORS })

}
Deno.serve(handler);