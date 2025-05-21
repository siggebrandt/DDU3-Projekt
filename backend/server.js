import { serveFile } from "jsr:@std/http";
//import { jsx } from "react/jsx-runtime";

function findUser(arrayOfUsers, userID) {
    return arrayOfUsers.find((user) => user.id === userID)
}

async function handler(request){
    const url = new URL(request.url);
    const database = Deno.readTextFileSync("database.json");
    const data = JSON.parse(database);
    const headersCORS = new Headers();

    headersCORS.set("Access-Control-Allow-Origin", "*");
    headersCORS.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, PATCH");
    headersCORS.set("Access-Control-Allow-Headers", "Content-Type");
    headersCORS.set("Content-Type", "application/json" );

    if(request.method === "OPTIONS") { return new Response(null, { status: 204, headers: headersCORS })};

    if(request.method === "GET"){
        /* Webbsidor */
        if(url.pathname === "/"){
            return await serveFile(request, "frontend/public/index.html");
        }
        /* if(url.pathname === "/create"){
            return await serveFile(request, "frontend/public/createGame.html");
        }
        if(url.pathname === "/join"){
            return await serveFile(request, "frontend/public/joinGame.html");
        } */
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
        if (url.pathname === "/users") {
            return new Response(JSON.stringify(data.users), { headers: headersCORS }); // array av alla användare
        }

        const userRoute = new URLPattern({ pathname: "/user/:id" });
        const userMatch = userRoute.exec(request.url);
        if (userMatch) {
            const userID = parseInt(userMatch.pathname.groups.id);
            const user = findUser(data.users, userID);
            if (user) {
                return new Response(JSON.stringify(user), { headers: headersCORS });
            } else {
                return new Response(JSON.stringify("Not Found, No user with that ID was found"), { status: 404, headers: headersCORS });
            }
        }

        /* User Settings */
        const userFollowingRoute = new URLPattern({ pathname: "/following/:id" });
        const userFollowingMatch = userFollowingRoute.exec(request.url);
        if (userFollowingMatch) {
            const userID = parseInt(userFollowingMatch.pathname.groups.id);
            let user = findUser(data.users, userID);
            if (user) {
                return new Response(JSON.stringify(user.following), { headers: headersCORS });
            } else {
                return new Response(JSON.stringify("Not Found, No user with that ID was found"), { status: 404, headers: headersCORS });
            }
        }

        /* Quiz */
        if (url.pathname === "/quiz") {
            return new Response(JSON.stringify(data.quiz), { headers: headersCORS });
        }
    }

    if (request.method === "POST") {
        const body = await request.json();
        if (request.headers.get("content-type") !== "application/json") {
            return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), { status: 406, headers: headersCORS });
        }
        if(url.pathname === "/login"){
            if (!body.username || !body.password) {
                return new Response(JSON.stringify("Bad Request, Attributes missing"), {status: 400, headers: headersCORS});
            }
            let user = data.users.find((user) => user.username === body.username);
            if (user) {
                if (user.password === body.password) {
                    return new Response(JSON.stringify(user), {headers: headersCORS});
                } else {
                    return new Response(JSON.stringify("Incorrect password"), {status: 401, headers: headersCORS});
                }
            } else {
                return new Response(JSON.stringify("User Not found"), { status: 404, headers: headersCORS });
            }
        }
        if(url.pathname === "/register"){
            if(body.username && body.password){
                if(data.users.some(user => user.username === body.username)){
                    return new Response(JSON.stringify("Conflict, username already exists"), { status: 409, headers: headersCORS })
                }
                if (!body.username || !body.password) {
                    return new Response(JSON.stringify("Bad Request, Attributes missing", {status: 400, headers: headersCORS}));
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
                    score: 0,
                    following: []
                }
                data.users.push(user);
                Deno.writeTextFileSync("database.json", JSON.stringify(data));
                return new Response(JSON.stringify(user), { status: 201, headers: headersCORS })
            }
        }

        if (url.pathname == "/quiz/create") { // { category: <siffra> (beroende på vilken quiz-sida vi är inne på), difficulty: <easy/medium/hard>}
            // Kategorier:  general knowledge: 9, filmer: 11, mygologi: 20, kändisar: 26, animals: 27, musik: 12
            if (!body.difficulty || !body.category) {
                return new Response(JSON.stringify("Bad request, attributes missing"), {status: 400, headers: headersCORS});
            }
            let quizQuestions = await fetch(`https://opentdb.com/api.php?amount=10&category=${body.category}&difficulty=${body.difficulty}&type=multiple`)
            quizQuestions = await quizQuestions.json();
            let sortedDb = data.quiz.sort((a, b) => b.id - a.id);
            let id;
            if (sortedDb.length === 0) {
                id = 1;
            } else {
                id = sortedDb[0].id + 1
            }
            if (quizQuestions.response_code === 0) {
                let obj = {
                    questions: quizQuestions.results,
                    category: quizQuestions.results[0].category,
                    difficulty: body.difficulty,
                    playedBy: [],
                    id: id
                }
                data.quiz.push(obj);
                Deno.writeTextFileSync("database.json", JSON.stringify(data));
                return new Response(JSON.stringify(obj), { status: 200, headers: headersCORS })
            } else {
                return new Response(JSON.stringify("oops, something went wrong"), { status: 400, headers: headersCORS })
            }
        }
    }

    if (request.method === "PATCH") {
        console.log("runs")
        const body = await request.json();
        if (request.headers.get("content-type") !== "application/json") {
            return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), { status: 406, headers: headersCORS });
        }
        //* User Settings */
        if (url.pathname === "/settings/changePassword") {
            if (!body.username || !body.password || !body.newPassword) {
                return new Response(JSON.stringify("Bad request, Attributes missing"), {status: 400, headers: headersCORS});
            }

            let user = data.users.find((user) => user.username === body.username);
            if (user) {
                if (user.password === body.password) {
                    let index = data.users.findIndex((user) => user.username === body.username);
                    data.users[index].password = body.newPassword;
                    Deno.writeTextFileSync("database.json", JSON.stringify(data));
                    return new Response(JSON.stringify(data.users[index]), {headers: headersCORS});
                } else {
                    return new Response(JSON.stringify("Incorrect Password"), {status: 401, headers: headersCORS});
                }
            } else {
                return new Response(JSON.stringify("Not Found, No user with that username was found"), {status: 404, headers: headersCORS});
            }
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