async function tester() {
    await test1();
    let credentials = await test4();
    await test7(credentials);
    await test25();
}

async function test1() {
    let resp = await fetch("http://localhost:8000/user");
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

async function test25() {
    let req = new Request("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({username: "bla", password: "bla"}),
        headers: {"content-type": "text/html"}
    });

    let resp = await fetch(req);
    if (resp.status === 406) {
        document.querySelector("#test25").classList.add("success");
    } else {
        document.querySelector("#test25").classList.add("fail");
    }
}

tester();