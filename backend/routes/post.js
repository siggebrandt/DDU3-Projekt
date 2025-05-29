export async function handlePOST(request, url, data, headersCORS) {
  const body = await request.json();

  if (request.headers.get("content-type") !== "application/json") {
    return new Response(JSON.stringify("Invalid Content-Type, JSON Expected"), {
      status: 406,
      headers: headersCORS,
    });
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
      Deno.writeTextFileSync("backend/database.json", JSON.stringify(data));
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
      Deno.writeTextFileSync("backend/database.json", JSON.stringify(data));
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
