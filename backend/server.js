import { serveFile } from "jsr:@std/http";

async function handler(request){
    const url = new URL(request.url);
    const database = Deno.readTextFileSync("database.json");
    const data = JSON.parse(database);
    const headersCORS = new Headers();

    headersCORS.set("Access-Control-Allow-Origin", "*");
    headersCORS.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    headersCORS.set("Access-Control-Allow-Headers", "Content-Type");
    headersCORS.set("Content-Type", "application/json" );

    if(request.method === "OPTIONS") { return new Response(null, {status: 204, headers: headersCORS}) };

    if(request.method === "GET"){
        if(url.pathname === "/"){
            return await serveFile(request, "frontend/public/index.html");
        }
        if(url.pathname === "/create"){
            return await serveFile(request, "frontend/public/createGame.html");
        }
        if(url.pathname === "/join"){
            return await serveFile(request, "frontend/public/joinGame.html");
        }
        if(url.pathname === "/play"){
            return await serveFile(request, "frontend/public/play.html");
        }
        if(url.pathname === "/script.js"){
            return await serveFile(request, "frontend/public/script.js");
        }
        if(url.pathname === "/style.css"){
            return await serveFile(request, "frontend/public/style.css");
        }
    }
    

    if (request.method === "POST") {
        const body = await request.json();
        if (request.headers.get("content-type") !== "application/json") {
            return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), {status: 406, headers: headersCORS});
        }
        if(url.pathname === "/login"){
            for(let user of data.users){
                if(user.username === body.username && user.password === body.password){
                    return new Response(JSON.stringify(user), { status: 200, headers: headersCORS})
                } else {
                    return new Response(JSON.stringify("Not found, username and password do not match!"), { status: 404, headers: headersCORS })
                }
            }

        }
        if (url.pathname === "/quiz") {
            

        }
    }

    return new Response(JSON.stringify(JSON.stringify("Bad Request")), { status: 400, headers: headersCORS })

}
Deno.serve(handler);