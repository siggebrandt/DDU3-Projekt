export async function handlePOST(request, url, data, headersCORS) {}

if (request.method === "GET") {
  if (url.pathname === "/favicon.ico") {
    return await serveFile(request, "frontend/public/favicon.ico");
  }
  /* Webbsidor */
  if (url.pathname === "/") {
    return await serveFile(request, "frontend/public/index.html");
  }
  if (url.pathname === "/quiz") {
    return await serveFile(request, "frontend/public/quiz.html");
  }
  if (url.pathname === "/play") {
    return await serveFile(request, "frontend/public/play.html");
  }
  if (url.pathname === "/script.js") {
    return await serveFile(request, "frontend/public/script.js");
  }
  if (url.pathname === "/style.css") {
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
      return new Response(
        JSON.stringify("Not Found, No user with that ID was found"),
        { status: 404, headers: headersCORS }
      );
    }
  }

  /* Quiz */
  if (url.pathname === "/quiz/all") {
    return new Response(JSON.stringify(data.quiz), { headers: headersCORS });
  }
}
