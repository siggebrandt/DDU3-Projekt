import { serveFile } from "jsr:@std/http";

function findUser(arrayOfUsers, userID) {
  return arrayOfUsers.find((user) => user.id === userID);
}

async function handler(request) {
  const url = new URL(request.url);
  const database = Deno.readTextFileSync("testdb.json");
  const data = JSON.parse(database);
  const headersCORS = new Headers();

  headersCORS.set("Access-Control-Allow-Origin", "*");
  headersCORS.set(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS, PATCH"
  );
  headersCORS.set("Access-Control-Allow-Headers", "Content-Type");
  headersCORS.set("Content-Type", "application/json");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: headersCORS });
  }

  if (request.method === "GET") {
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

    /* User Settings */
    const userFollowingRoute = new URLPattern({ pathname: "/following/:id" });
    const userFollowingMatch = userFollowingRoute.exec(request.url);
    if (userFollowingMatch) {
      const userID = parseInt(userFollowingMatch.pathname.groups.id);
      let user = findUser(data.users, userID);
      if (user) {
        return new Response(JSON.stringify(user.following), {
          headers: headersCORS,
        });
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

  if (request.method === "POST") {
    const body = await request.json();
    if (request.headers.get("content-type") !== "application/json") {
      return new Response(
        JSON.stringify("Invalid Content-Type, JSON Expected"),
        { status: 406, headers: headersCORS }
      );
    }
    if (url.pathname === "/login") {
      if (!body.username || !body.password) {
        return new Response(JSON.stringify("Bad Request, Attributes missing"), {
          status: 400,
          headers: headersCORS,
        });
      }
      let user = data.users.find((user) => user.username === body.username);
      if (user) {
        if (user.password === body.password) {
          return new Response(JSON.stringify(user), {
            status: 200,
            headers: headersCORS,
          });
        } else {
          return new Response(JSON.stringify("Incorrect password"), {
            status: 401,
            headers: headersCORS,
          });
        }
      } else {
        return new Response(JSON.stringify("User Not found"), {
          status: 404,
          headers: headersCORS,
        });
      }
    }
    if (url.pathname === "/register") {
      if (body.username && body.password && body.email) {
        if (data.users.some((user) => user.username === body.username)) {
          return new Response(
            JSON.stringify("Conflict, username already exists"),
            { status: 409, headers: headersCORS }
          );
        }
        if (!body.username || !body.password || !body.email) {
          return new Response(
            JSON.stringify("Bad Request, Attributes missing", {
              status: 400,
              headers: headersCORS,
            })
          );
        }
        const username = body.username;
        const password = body.password;
        let highestId = -1;
        for (let { id } of data.users) {
          if (id > highestId) {
            highestId = id;
          }
        }
        const userId = highestId + 1;
        const user = {
          id: userId,
          username: username,
          password: password,
          email: body.email,
          profilePic: "",
          score: {
            easy: {
              correct: 0,
              answered: 0,
            },
            medium: {
              correct: 0,
              answered: 0,
            },
            hard: {
              correct: 0,
              answered: 0,
            },
          },
        };
        data.users.push(user);
        Deno.writeTextFileSync("testdb.json", JSON.stringify(data));
        return new Response(JSON.stringify(user), {
          status: 201,
          headers: headersCORS,
        });
      }
    }

    if (url.pathname == "/quiz/create") {
      if (!body.difficulty || !body.category) {
        return new Response(JSON.stringify("Bad request, attributes missing"), {
          status: 400,
          headers: headersCORS,
        });
      }
      let quizQuestions = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${body.category}&difficulty=${body.difficulty}&type=multiple`
      );
      quizQuestions = await quizQuestions.json();
      let sortedDb = data.quiz.sort((a, b) => b.id - a.id);
      let id;
      if (sortedDb.length === 0) {
        id = 1;
      } else {
        id = sortedDb[0].id + 1;
      }
      if (quizQuestions.response_code === 0) {
        let obj = {
          questions: quizQuestions.results,
          category: quizQuestions.results[0].category,
          difficulty: body.difficulty,
          playedBy: [],
          id: id,
        };
        data.quiz.push(obj);
        Deno.writeTextFileSync("testdb.json", JSON.stringify(data));
        return new Response(JSON.stringify(obj), {
          status: 200,
          headers: headersCORS,
        });
      } else {
        return new Response(JSON.stringify("oops, something went wrong"), {
          status: 400,
          headers: headersCORS,
        });
      }
    }
  }

  if (request.method === "PATCH") {
    const body = await request.json();
    if (request.headers.get("content-type") !== "application/json") {
      return new Response(
        JSON.stringify("Invalid Content-Type, JSON Expected"),
        { status: 406, headers: headersCORS }
      );
    }
    //* User Settings */
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
          Deno.writeTextFileSync("testdb.json", JSON.stringify(data));
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
          Deno.writeTextFileSync("testdb.json", JSON.stringify(data));
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

    const profilePicPath = new URLPattern({ pathname: "/user/:id/profilePic" });
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
        Deno.writeTextFileSync("testdb.json", JSON.stringify(data));
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

  if (request.method === "DELETE") {
    const body = await request.json();
    if (request.headers.get("content-type") !== "application/json") {
      return new Response(
        JSON.stringify("Invalid Content-Type, JSON Expected"),
        { status: 406, headers: headersCORS }
      );
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
          Deno.writeTextFileSync("testdb.json", JSON.stringify(data));
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
  return new Response(JSON.stringify(JSON.stringify("Bad Request")), {
    status: 400,
    headers: headersCORS,
  });
}
Deno.serve(handler);
