export async function handlePATCH(request, url, data, headersCORS) {
  const body = await request.json();
  if (request.headers.get("content-type") !== "application/json") {
    return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), {
      status: 406,
      headers: headersCORS,
    });
  }
  if (url.pathname === "/settings/changePassword") {
    if (!body.username || !body.password || !body.newPassword) {
      return new Response(JSON.stringify("Bad request, Attributes missing"), {
        status: 400,
        headers: headersCORS,
      });
    }
    if (body.password === body.newPassword) {
      return new Response(
        JSON.stringify("Bad Request, Old and New password are the same"),
        { status: 400, headers: headersCORS }
      );
    }

    let user = data.users.find((user) => user.username === body.username);
    if (user) {
      if (user.password === body.password) {
        let index = data.users.findIndex(
          (user) => user.username === body.username
        );
        data.users[index].password = body.newPassword;
        Deno.writeTextFileSync("backend/database.json", JSON.stringify(data));
        return new Response(JSON.stringify(data.users[index]), {
          headers: headersCORS,
        });
      } else {
        return new Response(JSON.stringify("Incorrect Password"), {
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
  const userRoute = new URLPattern({ pathname: "/user/:id/score" });
  const userMatch = userRoute.exec(request.url);
  if (userMatch) {
    const requestId = userMatch.pathname.groups.id;
    let user = data.users.find((user) => user.id == requestId);
    if (user) {
      if (body.difficulty && body.correct && body.answered) {
        let difficulty = body.difficulty;
        let correct = body.correct;
        let answered = body.answered;
        user.score[difficulty].correct =
          user.score[difficulty].correct + correct;
        user.score[difficulty].answered =
          user.score[difficulty].answered + answered;
        Deno.writeTextFileSync("backend/database.json", JSON.stringify(data));
        return new Response(JSON.stringify("The score is now updated"), {
          status: 200,
          headers: headersCORS,
        });
      }
    } else {
      return new Response(
        JSON.stringify("Not Found, No user with that id was found"),
        { status: 404, headers: headersCORS }
      );
    }
  }

  const profilePicPath = new URLPattern({
    pathname: "/user/:id/profilePic",
  });
  const profilePicMatch = profilePicPath.exec(url);
  if (profilePicMatch) {
    if (!body.profilePic) {
      return new Response(JSON.stringify("Bad request, missing attribute"), {
        status: 400,
        headers: headersCORS,
      });
    }

    let userID = parseInt(profilePicMatch.pathname.groups.id);
    let user = data.users.find((user) => user.id === userID);
    if (user) {
      let index = data.users.findIndex((user) => user.id === userID);
      data.users[index].profilePic = body.profilePic;
      Deno.writeTextFileSync("backend/database.json", JSON.stringify(data));
      return new Response(JSON.stringify("Profilepic Updated"), {
        headers: headersCORS,
      });
    } else {
      return new Response(JSON.stringify("User not found"), {
        status: 404,
        headers: headersCORS,
      });
    }
  }
}
