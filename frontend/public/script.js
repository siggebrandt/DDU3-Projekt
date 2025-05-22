const websiteURL = "http:localhost:8000";

class CreateQuestion{
    constructor(data){
        this.question = this.decode(data.question);
        this.correct = data.correct_answer;
        const allAnswers = [this.correct, ...data.incorrect_answers.map(this.decode)]
        this.choices = this.shuffle(allAnswers);
    }
   
    isCorrect (answer){
        return answer === this.correct;
    }
    decode (answer){
        return answer.replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&amp;/g, "&")
                .replace(/&ntilde;/g, "ñ")
                .replace(/&ldquo;/g, '"')
                .replace(/&hellip;/g, "…")
                .replace(/&rdquo;/g, '"')
                .replace(/&eacute;/g, "é");
    }

    shuffle (array){
        const shuffledArray = [];
        let counter = 0;
        while(counter < 4){
            const randomIndex = Math.floor(Math.random() * (4 - counter))
            shuffledArray.push(array[randomIndex]);
            array.splice(randomIndex, 1);
            counter++;
        }
        return shuffledArray;
    }
}
const testData = {"type":"multiple","difficulty":"medium","category":"Entertainment: Video Games","question":"In Terraria, what does the Wall of Flesh not drop upon defeat?","correct_answer":"Picksaw","incorrect_answers":["Pwnhammer","Breaker Blade","Laser Rifle"]}
let question1 = new CreateQuestion(testData)
console.log(question1.question, question1.choices);

// The diffrent pages
const homepageMain = document.querySelector("#homepageMain");
const loginMain = document.querySelector("#loginMain");
const registerMain = document.querySelector("#registerMain");
const quizMain = document.querySelector("#quizMain");
const quizPlayMain = document.querySelector("#quizPlayMain");
const leaderboardMain = document.querySelector("#leaderboardMain");
const profileMain = document.querySelector("#profileMain");

function hidePages (){
    homepageMain.style.display = "none";
    loginMain.style.display = "none";
    registerMain.style.display = "none";
    quizMain.style.display = "none";
    quizPlayMain.style.display = "none";
    leaderboardMain.style.display = "none";
    profileMain.style.display = "none";
}
hidePages();
homepageMain.style.display = "block";

// Nav
document.querySelector("#logo h1").addEventListener("click", function () { 
    hidePages()
    homepageMain.style.display = "block" 
})

// Login
let loggedInUser = null; 
const loginButtonNav = document.getElementById("loginButton");
loginButtonNav.addEventListener("click", () => {
    hidePages()
    loginMain.style.display = "block";
});

const loginButton = document.querySelector("#loginMain #loginButton");
const updateStatus = document.createElement("p");
loginMain.appendChild(updateStatus);
loginButton.addEventListener("click", async () => {
    const username = document.querySelector("#loginMain #username").value;
    const password = document.querySelector("#loginMain #password").value;
    const options = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username,
            password: password
        })
    }
    const response = await fetch(websiteURL + "/login", options);
    console.log(response)
    if (response.status === 200){
        updateStatus.textContent = "Login was successfull"
        loggedIn();
        setTimeout(function (){
            hidePages();
            homepageMain.style.display = "block";
        }, 2000);
    } else {
        updateStatus.textContent = "Password or username is incorrect! Please try again"
    }
})
// Register
const registerButtonNav = document.querySelector("#registerButton");
registerButtonNav.addEventListener("click", () => {
    hidePages();
    registerMain.style.display = "block";

    const username = document.querySelector("#register-username");
    const password = document.querySelector("#register-password");
    const repeatedPassword = document.querySelector("#password2");
    const email = document.querySelector("#e-mail");
    const status = document.querySelector("#register-status");
    
    const registerButton = document.querySelector("#register-button");
    registerButton.addEventListener("click", async () => {
        if (password.value !== repeatedPassword.value) {
            status.textContent = "Passwords do not match!";
            return;
        }
        const req = new Request(`${websiteURL}/register`, {
            method: "POST",
            body: JSON.stringify({username: username.value, password: password.value, email: email.value}),
            headers: {"content-type": "application/json"}
        });
        let resp = await fetch(req);
        if (resp.status === 201) {
            status.textContent = "Register successfull! You can now login!";
        } else if (resp.status === 409) {
            status.textContent = "Username already in use, try again";
        } else {
            status.textContent = "One or more inputs are empty! Try again."
        }
    })
})

/* Home Page Quiz Images */
const pexelsAPIKey = `cXn9wuBWnFORyTJfxStIcrw8IouzHJjzXmR6XhQZ8FJl0HNOlZJe0pzb`

const quizCategories = ["Knowledge", "Movies", "Music"]
quizCategories.forEach(category => {
    fetch(`https://api.pexels.com/v1/search?query=${category}&per_page=1`, {
      headers: {
        Authorization: pexelsAPIKey
      }
    })
    .then(response => response.json())
    .then(data => {
        const photo = data.photos[0];
        console.log(category, "pexel", data);
    
        // Skapa ett ID som matchar t.ex. "quizMusic", "quizMovie", etc.
        const elementId = `quiz${category}`;
        const element = document.getElementById(elementId);

        element.addEventListener("click", function() {
            hidePages();
            quizMain.style.display = "block";
        })
        
        if (element && photo) {
          element.style.backgroundImage = `url('${photo.src.landscape}')`;
        }
      })
      .catch(error => {
        console.error(`Något gick snett med kategorin ${category}`, error);
      });
});


fetch(`https://api.pexels.com/v1/search?query=${quizCategories[0]}&per_page=1`, {
    headers: {
      Authorization: pexelsAPIKey
    }})
.then(response => response.json())
.then(data => {
    const photo = data.photos[0];
    console.log("pexel", data)
    const element = document.getElementById("quizMusic");
      element.style.backgroundImage = `url('${photo.src.landscape}')`;
})
document.getElementById("playQuizButton").addEventListener("click", async function() {
    const difficultyChosen = document.getElementById("chooseDifficultyDropdown").value;
        console.log("difficulty:",difficultyChosen)

        hidePages();
        quizPlayMain.style.display = "block";


    fetch(`${websiteURL}/quiz/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: difficultyChosen, category: 11 }),
        })
        .then(response => response.json())
        .then(async function(data) {
        await startQuiz(data);
        });
})

async function startQuiz(questions) {
    console.log("Quiz started:",questions);
    document.getElementById("quizQuestion").style.padding = "30px"
    let quizProgress = 0;
    let correctAnswers = 0;

    function showQuestion () {
        let currentQuestions = new CreateQuestion(questions.questions[quizProgress]);
        let haveAnswered = false;

        console.log(currentQuestions);

        const quizQuestion = document.getElementById("quizQuestion");
        const quizChoices = document.getElementById("quizChoices");
        const quizResponse = document.getElementById("quizResponse");

        quizQuestion.innerHTML = currentQuestions.question;
        quizChoices.innerHTML = "";
        quizResponse.innerHTML = "";

        currentQuestions.choices.forEach(choice => {
            const choiceButton = document.createElement("div");
            choiceButton.className = "flexItem quizAnswerButton textAlignCenter";
            choiceButton.textContent = choice;
            quizChoices.appendChild(choiceButton);

            choiceButton.addEventListener("click", function() {
                if (!haveAnswered) {
                haveAnswered = true;

                document.getElementById("quizResponse").innerHTML = currentQuestions.isCorrect(choice);

                for (let button of document.querySelectorAll(".quizAnswerButton")) {
                    button.style.backgroundColor = "#ef2d56";
                    if (button.textContent === currentQuestions.correct) {
                        button.style.backgroundColor = "#2fbf71"
                    }
                }
                //document.getElementById("quizResponse").style.backgroundColor = "red"

                console.log(document.querySelectorAll(".quizAnswerButton"))

                if (currentQuestions.isCorrect(choice)) {
                    correctAnswers++;
                    //choiceButton.style.backgroundColor = "#87986A"
                    document.getElementById("quizResponse").style.backgroundColor = "green"
                }
                setTimeout(function () {
                    quizProgress++;
                    if (quizProgress < 10) {
                        showQuestion();
                        console.log("progress:", quizProgress)
                    } else if (quizProgress >= 10) {
                        // alla frågor svarade
                    }
                }, 1500);
            }
            })
        })
    }
    showQuestion();
}


// Leaderboard
async function createLeaderboard() {
    const response = await fetch("http://localhost:8000/users");
    const users = await response.json();
    const leaderboardMain = document.querySelector("#leaderboardMain");
    for(let user of users){
        const easyScore = user.score.easy;
        const mediumScore = user.score.medium;
        const hardScore = user.score.hard;
        const userDiv = document.createElement("div");
        
        leaderboardMain.appendChild(userDiv);
        
        userDiv.innerHTML += `
        <div class="user"> 
        <p>${user.username}</p>
        <div class="userScores">
        <div class="scoreCircle">
        <div style="background-color: rgba(0, 150, 0, ${easyScore})"></div>
        </div>
        <div class="scoreCircle">
        <div style="background-color: rgba(255, 200, 0, ${mediumScore})"></div>
        </div>
        <div class="scoreCircle">
        <div style="background-color: rgba(150, 0, 0, ${hardScore})"></div>
        </div>
        </div>
        </div
        `;
    }
}
createLeaderboard();
const leaderboardButton = document.querySelector("#leaderboardButton");
leaderboardButton.addEventListener("click", () => {
    hidePages();
    leaderboardMain.style.display = "block";
})
function loggedIn (){
    loginButtonNav.style.display = "none";
    document.getElementById("registerButton").style.display = "none"
    const profilButton = document.createElement("button");
    const navLinks = document.querySelector("#navLinks");
    profilButton.classList.add("navButton");
    profilButton.id = "profileButton";
    navLinks.appendChild(profilButton);
    profilButton.textContent = "Profil"
    profilButton.addEventListener("click", showProfile);
}
// Register

//Profile
async function showProfile() {
    hidePages();
    profileMain.style.display = "block";
    let profile = document.createElement("div");
    profile.id = "profile";
    profile.innerHTML = `
    <div id="profilePic">
        <img src=""
    `
}
showProfile();

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
        this.profilePic = data.profilePic;
    }

    async getUserStats() {
        let req = new Request(`${websiteURL}/user/${this.id}`);
        let resp = await fetch(req);
        console.log(resp);
        if (resp.ok) {
            let reso = await resp.json();
            console.log(reso);
            return reso.score;
        }
    }
}
