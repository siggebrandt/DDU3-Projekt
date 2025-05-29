import { serveFile } from "jsr:@std/http";

export async function handleGET(request, url, data, headersCORS) {
  // Filer
  if (url.pathname === "/favicon.ico") {
    return await serveFile(request, "frontend/public/favicon.ico");
  }
  if (url.pathname === "/") {
    return await serveFile(request, "frontend/public/index.html");
  }
  if (url.pathname === "/script.js") {
    return await serveFile(request, "frontend/public/script.js");
  }
  if (url.pathname === "/style.css") {
    return await serveFile(request, "frontend/public/style.css");
  }

  // User
  if (url.pathname === "/users") {
    return new Response(JSON.stringify(data.users), { headers: headersCORS }); // array av alla användare
  }
  const userRoute = new URLPattern({ pathname: "/user/:id" });
  const userMatch = userRoute.exec(request.url);
  if (userMatch) {
    const userID = parseInt(userMatch.pathname.groups.id);
    const user = data.users.find((user) => user.id === userID);
    if (user) {
      return new Response(JSON.stringify(user), { headers: headersCORS });
    } else {
      return new Response(
        JSON.stringify("Not Found, No user with that ID was found"),
        { status: 404, headers: headersCORS }
      );
    }
  }

  // Quiz
  if (url.pathname === "/quiz/all") {
    return new Response(JSON.stringify(data.quiz), { headers: headersCORS });
  }
}
