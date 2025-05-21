async function tester() {
    let servStatus = await serverStatus();
    if (!servStatus) {return}
    await test1();
    await test2();
    await test3();
    let credentials = await test4();
    await test5();
    await test6(credentials);
    await test7(credentials);
    await test8();
    await test9();
    await test10(credentials);
    await test11();
    await test12();
    await test21();
    await test22();
    await test24();
    await test25();
}

async function serverStatus() {
    try {
        let resp = await fetch("http://localhost:8000/test");
        if (resp.status === 400) {
            document.querySelector("#server-status").style.display = "none";
            return true;
        }
    } catch (e) {
        document.querySelector("#server-status").textContent = "Network error, server unreachable";
        return false;
    }
}

async function test1() {
    let resp = await fetch("http://localhost:8000/users");
    if (resp.ok) {
        let reso = await resp.json();
        if (typeof reso === "object") {
            document.querySelector("#test1").classList.add("success");
            document.querySelector("#test1 .status").textContent = "Success!";
        } else {
            document.querySelector("#test1").classList.add("fail");
        }
    } else {
        document.querySelector("#test1").classList.add("fail");
    }
}

async function test2() {
    let resp = await fetch("http://localhost:8000/user/0");
    if (resp.status === 200) {
        let reso = await resp.json();
        if (reso.id === 0) {
            document.querySelector("#test2").classList.add("success");
            document.querySelector("#test2 .status").textContent = "Success!";
        } else {
            document.querySelector("#test2").classList.add("fail");
            document.querySelector("#test2 .status").textContent = "Failed!";
        }
    } else {
        document.querySelector("#test2").classList.add("fail");
        document.querySelector("#test2 .status").textContent = "Failed!";
    }
}

async function test3() {
    let resp = await fetch("http://localhost:8000/user/427164712421");
    if (resp.status === 404) {
        document.querySelector("#test3").classList.add("success");
        document.querySelector("#test3 .status").textContent = "Success!";
    } else {
        document.querySelector("#test3").classList.add("fail");
        document.querySelector("#test3 .status").textContent = "Failed!";
    }
}

async function test4() {
    let num = Math.floor(Math.random() * 1000000);
    let req = new Request("http://localhost:8000/register", {
        method: "POST",
        body: JSON.stringify({username: `${num}`, password: "test123"}),
        headers: {"content-type": "application/json"}
    });

    let resp = await fetch(req);
    if (resp.status === 201) {
        let reso = await resp.json();
        if (typeof reso.id === "number") {
            document.querySelector("#test4").classList.add("success");
            document.querySelector("#test4 .status").textContent = "Success!";
            return reso;
        } else {
            document.querySelector("#test4").classList.add("fail");
        }
    } else {
        document.querySelector("#test4").classList.add("fail");
    }
}

async function test5() {
    let req = new Request("http://localhost:8000/register", {
        method: "POST",
        body: JSON.stringify({username: "test"}),
        headers: {"content-type": "application/json"}
    });

    let resp = await fetch(req);
    if (resp.status === 400) {
        document.querySelector("#test5").classList.add("success");
        document.querySelector("#test5 .status").textContent = "Success!";
    } else {
        document.querySelector("#test5").classList.add("fail");
        document.querySelector("#test5 .status").textContent = "Failed!";
    }
}

async function test6(credentials) {
    let req = new Request("http://localhost:8000/register", {
        method: "POST",
        body: JSON.stringify({username: credentials.username, password: "test"}),
        headers: {"content-type": "application/json"}
    });
    let resp = await fetch(req);
    if (resp.status === 409) {
        document.querySelector("#test6").classList.add("success");
        document.querySelector("#test6 .status").textContent = "Success!";
    } else {
        document.querySelector("#test6").classList.add("fail");
        document.querySelector("#test6 .status").textContent = "Failed!";
    }
}

async function test7(credentials) {
    let req = new Request("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({username: credentials.username, password: credentials.password}),
        headers: {"content-type": "application/json"}
    });

    let resp = await fetch(req);
    if (resp.status === 200) {
        let reso = await resp.json();
        if (reso.username === credentials.username && reso.password === credentials.password) {
            document.querySelector("#test7").classList.add("success");
            document.querySelector("#test7 .status").textContent = "Success!";
        } else {
            document.querySelector("#test7").classList.add("fail");
        }
    } else {
        document.querySelector("#test7").classList.add("fail");
    }
}

async function test8() {
    let req = new Request("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({username: "test"}),
        headers: {"content-type": "application/json"}
    });
    let resp = await fetch(req);
    if (resp.status === 400) {
        document.querySelector("#test8").classList.add("success");
        document.querySelector("#test8 .status").textContent = "Success!";
    } else {
        document.querySelector("#test8").classList.add("fail");
        document.querySelector("#test8 .status").textContent = "Failed!";
    }
}

async function test9() {
    let req = new Request("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({username: "idontexist", password: "test"}),
        headers: {"content-type": "application/json"}
    });
    let resp = await fetch(req);
    if (resp.status === 404) {
        document.querySelector("#test9").classList.add("success");
        document.querySelector("#test9 .status").textContent = "Success!";
    } else {
        document.querySelector("#test9").classList.add("fail");
        document.querySelector("#test9 .status").textContent = "Failed!";
    }
}

async function test10(credentials) {
    let req = new Request("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({username: credentials.username, password: "wrong"}),
        headers: {"content-type": "application/json"}
    });
    let resp = await fetch(req);
    if (resp.status === 401) {
        document.querySelector("#test10").classList.add("success");
        document.querySelector("#test10 .status").textContent = "Success!";
    } else {
        document.querySelector("#test10").classList.add("fail");
        document.querySelector("#test10 .status").textContent = "Failed!";
    }
}

async function test11() {
    let req = new Request("http://localhost:8000/following/0");
    let resp = await fetch(req);
    if (resp.status === 200) {
        let reso = await resp.json();
        if (Array.isArray(reso)) {
            document.querySelector("#test11").classList.add("success");
            document.querySelector("#test11 .status").textContent = "Success!";
        } else {
            document.querySelector("#test11").classList.add("fail");
            document.querySelector("#test11 .status").textContent = "Failed!";
        }
    } else {
        document.querySelector("#test11").classList.add("fail");
        document.querySelector("#test11 .status").textContent = "Failed!";
    }
}

async function test12() {
    let req = new Request("http://localhost:8000/following/2894124687125");
    let resp = await fetch(req);
    if (resp.status === 404) {
        document.querySelector("#test12").classList.add("success");
        document.querySelector("#test12 .status").textContent = "Success!";
    } else {
        document.querySelector("#test12").classList.add("fail");
        document.querySelector("#test12 .status").textContent = "Failed!";
    }
}

async function test21() {
    let resp = await fetch("http://localhost:8000/quiz");
    if (resp.status === 200) {
        let reso = await resp.json();
        if (typeof reso === "object") {
            document.querySelector("#test21").classList.add("success");
            document.querySelector("#test21 .status").textContent = "Success!";
        } else {
            document.querySelector("#test21").classList.add("fail");
            document.querySelector("#test21 .status").textContent = "Failed!";
        }
    } else {
        document.querySelector("#test21").classList.add("fail");
        document.querySelector("#test21 .status").textContent = "Failed!";
    }
}

async function test22() {
    let req = new Request("http://localhost:8000/quiz/create", {
        method: "POST",
        body: JSON.stringify({difficulty: "easy", category: 21}),
        headers: {"content-type": "application/json"}
    });
    let resp = await fetch(req);
    if (resp.status === 200) {
        let reso = await resp.json();
        if (reso.questions && reso.id) {
            document.querySelector("#test22").classList.add("success");
            document.querySelector("#test22 .status").textContent = "Success!";
        } else {
            document.querySelector("#test22").classList.add("fail");
            document.querySelector("#test22 .status").textContent = "Failed!";
        }
    } else {
        document.querySelector("#test22").classList.add("fail");
        document.querySelector("#test22 .status").textContent = "Failed!";
    }
}

async function test24() {
    let resp = await fetch("http://localhost:8000/wrongEndpoint");
    if (resp.status === 400) {
        document.querySelector("#test24").classList.add("success");
        document.querySelector("#test24 .status").textContent = "Success!";
    } else {
        document.querySelector("#test24").classList.add("fail");
        document.querySelector("#test24 .status").textContent = "Failed!";
    }
}

async function test25() {
    let req = new Request("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({username: "bla", password: "bla"}),
        headers: {"content-type": "text/html"}
    });

    let resp = await fetch(req);
    if (resp.status === 406) {
        document.querySelector("#test25").classList.add("success");
        document.querySelector("#test25 .status").textContent = "Success!";
    } else {
        document.querySelector("#test25").classList.add("fail");
        document.querySelector("#test25 .status").textContent = "Failed!";
    }
}

tester();