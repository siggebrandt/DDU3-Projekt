import * as klara from "./klara.js";
import * as neo from "./neo.js";
import * as sigge from "./sigge.js";

let usersInput = prompt("Write something!");
if (usersInput === "neo") {
    neo.hello();
} else if (usersInput === "klara") {
    klara.hello();
} else if (usersInput === "sigge") {
    sigge.hello();
} else {
    console.log(usersInput)
}
