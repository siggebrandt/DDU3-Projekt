const websiteURL = "http://localhost:8000"; // använd dena variabel för websidans-URL, representerar localhost OCH serverlänken

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

function hidePages (){
    homepageMain.style.display = "none";
    loginMain.style.display = "none";
    registerMain.style.display = "none";
    quizMain.style.display = "none";
    quizPlayMain.style.display = "none"
    leaderboardMain.style.display = "none";
}
hidePages();
homepageMain.style.display = "block";

// Login 
const loginButtonNav = document.getElementById("loginButton");
loginButtonNav.addEventListener("click", () => {
    hidePages()
    loginMain.style.display = "block";
    const loginButton = document.querySelector("#loginMain #loginButton");
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
        if (response.status === 200){
            loginMain.innerHTML += "Login was successfull"
        } else {
            loginMain.innerHTML += "Password or username is incorrect! Please try again"
        }
    })
});

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

const quizCategories = ["music", "movie"]
fetch(`https://api.pexels.com/v1/search?query=${quizCategories[0]}&per_page=1`, {
    headers: {
      Authorization: pexelsAPIKey
    }})
.then(response => response.json())
.then(data => {
    const photo = data.photos[0];
    console.log("pexel", data)
    const element = document.getElementById("pexelsTest");
      element.style.backgroundImage = `url('${photo.src.landscape}')`;
})
document.getElementById("playQuizButton").addEventListener("click", async function() {
    const difficultyChosen = document.getElementById("chooseDifficultyDropdown").value;
        console.log(difficultyChosen)
        

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
                }, 3000);
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

// Register
