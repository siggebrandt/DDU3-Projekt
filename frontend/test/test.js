async function tester() {
    await test1();
}

async function test1() {
    let resp = await fetch("http://localhost:8000/user");
    if (resp.ok) {
        let reso = await resp.json();
        if (typeof reso === "object") {
            document.querySelector("#test1").classList.add("success");
        } else {
            document.querySelector("#test1").classList.add("fail");
        }
    } else {
        document.querySelector("#test1").classList.add("fail");
    }
}

tester();