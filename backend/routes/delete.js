export async function handleDELETE(request, url, data, headersCORS) {
  const body = await request.json();
  if (request.headers.get("content-type") !== "application/json") {
    return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), {
      status: 406,
      headers: headersCORS,
    });
  }
  if (!body.username || !body.password || !body.repeatPassword) {
    return new Response(JSON.stringify("Bad request, Attributes missing"), {
      status: 400,
      headers: headersCORS,
    });
  }
  if (body.password !== body.repeatPassword) {
    return new Response(JSON.stringify("Password do not match"), {
      status: 400,
      headers: headersCORS,
    });
  }
  if (url.pathname === "/settings/deleteAccount") {
    let user = data.users.find((user) => user.username === body.username);
    if (user) {
      if (user.password === body.password) {
        let index = data.users.findIndex(
          (user) => user.username === body.username
        );
        data.users.splice(index, 1);
        Deno.writeTextFileSync("backend/database.json", JSON.stringify(data));
        return new Response(JSON.stringify("User successfully deleted"), {
          headers: headersCORS,
        });
      } else {
        return new Response(JSON.stringify("Incorrect password"), {
          status: 401,
          headers: headersCORS,
        });
      }
    } else {
      return new Response(
        JSON.stringify("Not Found, No user with that username was found"),
        { status: 404, headers: headersCORS }
      );
    }
  }
}
