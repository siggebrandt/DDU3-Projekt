import { serveFile } from "jsr:@std/http";

async function handler(request){
    const url = new URL(request.url);
    const database = Deno.readTextFileSync("backend/database.json");
    const data = JSON.parse(database);
    const headersCORS = new Headers();

    headersCORS.set("Access-Control-Allow-Origin", "*");
    headersCORS.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    headersCORS.set("Access-Control-Allow-Headers", "Content-Type");
    headersCORS.set("Content-Type", "application/json" );

    if(request.method === "OPTIONS") { return new Response(null, { status: 204, headers: headersCORS} )};

    if(request.method === "GET"){
        /* Webbsidor */
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
        
        /* User */
        if (url.pathname === "/user") {
            return new Response(JSON.stringify("")) // array av alla användare
        }

        const userRoute = new URLPattern({ pathname: "/user/:id" });
        const userMatch = userRoute.exec(request.url);
        if (userMatch) {
            const userID = userMatch.pathname.groups.id;
            // loopa igenom alla användare, och hitta användaren med ID:et
            /** const entry = arrayOfUsers.find(
                (entry) => entry.name.toLowerCase() == userID.toLowerCase()
                );
             * if (entry) {
                return new Response(JSON.stringify(entry));
                } else {
                 return new Response(null, { status: 404, headers: headersCORS });
                });
             *  } */
        }

        /* User Settings */
        const userSettingsRoute = new URLPattern({ pathname: "/settings/:id" });
        const userSettingsMatch = userSettingsRoute.exec(request.url);
        if (userSettingsMatch) {
            const userID = userSettingsMatch.pathname.groups.id;
            // loopa igenom alla användare, och hitta användaren med ID:et
            /** const entry = arrayOfUsers.find(
                (entry) => entry.name.toLowerCase() == userID.toLowerCase()
                );
             * if (entry) {
                return new Response(JSON.stringify(entry.settings));
                } else {
                 return new Response(null, { status: 404, headers: headersCORS });
                });
             *  } */
        }

        

        /* Quiz */
        if (url.pathname == "/quiz/create") {
            const body = await request.json(); // { category: <siffra> (beroende på vilken quiz-sida vi är inne på), difficulty: <easy/medium/hard>}
            let quizQuestions = await fetch(`https://opentdb.com/api.php?amount=10&category=${body.category}&difficulty=${body.difficulty}&type=multiple`)
            quizQuestions = await quizQuestions.json();
            if (quizQuestions.response_code === 0) {
                console.log(quizQuestions)
                return new Response(JSON.stringify(quizQuestions, null, 2), { status: 200, headers: headersCORS })
            } else {
                return new Response(JSON.stringify("oops, something went wrong"), { status: 400, headers: headersCORS })
            }
        }
    }

    if (request.method === "POST") {
        const body = await request.json();
        if (request.headers.get("content-type") !== "application/json") {
            return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), { status: 406, headers: headersCORS });
        }
        if(url.pathname === "/login"){
            for(let user of data.users){
                if(user.username === body.username && user.password === body.password){
                    return new Response(JSON.stringify(user), { status: 200, headers: headersCORS })
                } else {
                    return new Response(JSON.stringify("Not found, username and password do not match!"), { status: 404, headers: headersCORS })
                }
            }
        }
        if(url.pathname === "/register"){
            if(body.username && body.password){
                if(data.users.some(user => user.username === body.username)){
                    return new Response(JSON.stringify("Conflict, username already exists"), { status: 409, headers: headersCORS })
                }
                const username = body.username;
                const password  = body.password;
                let highestId = -1;
                for(let { id } of data.users){
                    if (id > highestId){
                        highestId = id;
                    }
                }
                const userId = highestId + 1;
                const user = {
                    id: userId,
                    username: username,
                    password: password,
                    score: 0
                }
                data.users.push(user);
                Deno.writeTextFileSync("backend/database.json", JSON.stringify(data));
                return new Response(JSON.stringify(user), { status: 201, headers: headersCORS})
            }
        }
    }

    if (request.method === "PATCH") {
        const body = await request.json();
        if (request.headers.get("content-type") !== "application/json") {
            return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), { status: 406, headers: headersCORS });
        }
        //* User Settings */
        if (url.pathname === "/settings/changePassword") {
            //
        }
    }

    if (request.method === "DELETE") {
        const body = await request.json();
        if (request.headers.get("content-type") !== "application/json") {
            return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), { status: 406, headers: headersCORS });
        }
        if (url.pathname === "/settings/deleteAccount") {
            //
        }
    }
    return new Response(JSON.stringify(JSON.stringify("Bad Request")), { status: 400, headers: headersCORS })

}
Deno.serve(handler);