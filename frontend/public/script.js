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
const testData = {"type":"multiple","difficulty":"medium","category":"Entertainment: Video Games","question":"In Terraria, what does the Wall of Flesh not drop upon defeat?","correct_answer":"Picksaw","incorrect_answers":["Pwnhammer","Breaker Blade","Laser Rifle"]}
let question1 = new CreateQuestion(testData)
console.log(question1.question, question1.choices);

// The diffrent pages
const homepageMain = document.querySelector("#homepageMain");
const loginMain = document.querySelector("#loginMain");
const registerMain = document.querySelector("#registerMain");
const quizMain = document.querySelector("#quizMain");
const quizPlayMain = document.querySelector("#quizPlayMain");
const quizResultMain = document.querySelector("#quizResultMain");
const leaderboardMain = document.querySelector("#leaderboardMain");
const profileMain = document.querySelector("#profileMain");
const profilePicOverlay = document.querySelector("#profilePicPicker-overlay");
const changeOverlay = document.querySelector("#changePassword-overlay");

function hidePages (){
    homepageMain.style.display = "none";
    loginMain.style.display = "none";
    registerMain.style.display = "none";
    quizMain.style.display = "none";
    quizPlayMain.style.display = "none";
    quizResultMain.style.display = "none";
    leaderboardMain.style.display = "none";
    profileMain.style.display = "none";
    profilePicOverlay.style.display = "none";
    changeOverlay.style.display = "none";
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
        let resource = await response.json();
        loggedInUser = new User(resource);
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
const siggePexelsAPIKey = `cXn9wuBWnFORyTJfxStIcrw8IouzHJjzXmR6XhQZ8FJl0HNOlZJe0pzb`;
const neoPexelsAPIKey = `sQLMQfpcJkVFD8dbejB6VqtaMkmnv7rIyaHrR45W2tOG5UWyaAeR4wfe`;

const quizCategories = ["Knowledge", "Movies", "Music"]
quizCategories.forEach(category => {
    fetch(`https://api.pexels.com/v1/search?query=${category}&per_page=1`, {
      headers: {
        Authorization: siggePexelsAPIKey
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

/* 
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
}) */
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
        await startQuiz(data, difficultyChosen);
        });
})

async function startQuiz(questions, difficultyChosen) {
    console.log("Quiz started:",questions);
    document.getElementById("quizQuestion").style.padding = "30px"
    let quizProgress = 0;
    let correctAnswers = 0;

    function showQuestion () {
        let currentQuestions = new CreateQuestion(questions.questions[quizProgress]);
        let haveAnswered = false;

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

                if (currentQuestions.isCorrect(choice)) {
                    correctAnswers++;
                    document.getElementById("quizResponse").style.backgroundColor = "green"
                }
                setTimeout(function () {
                    quizProgress++;
                    if (quizProgress < 10) {
                        showQuestion();
                        console.log("progress:", quizProgress)
                    } else if (quizProgress >= 10) {
                        hidePages()
                        quizResultMain.style.display = "block";
                        if (loggedInUser) {
                            console.log(loggedInUser);
                            fetch(`${websiteURL}/user/${loggedInUser.id}/score`, {
                                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ difficulty: difficultyChosen, correct: correctAnswers, answered: 10 })
                            })
                            .then(response => response.json())
                            .then(console.log)
                        }

                        document.getElementById("resultsOfQuiz").innerHTML = `
                        <div id="quizScore" class="textAlignCenter">Du fick ${correctAnswers} rätt av 10 möjliga!
                        <div id="returnHome" class="flexContainer flexJustifyCenter"><div id="returnHomeButton">Gå tillbaka till startsidan</div></div>
                        </div>`
                        document.getElementById("returnHomeButton").addEventListener("click", function () {
                            hidePages()
                            homepageMain.style.display = "block";
                        })
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
        const easyScore = user.score.easy.correct / user.score.easy.answered;
        const mediumScore = user.score.medium.correct / user.score.medium.answered;
        const hardScore = user.score.hard.correct / user.score.hard.answered;
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
    profilButton.textContent = "Profile"
    profilButton.addEventListener("click", showProfile);
}
// Register

//Profile
async function showProfile() {
    hidePages();
    profileMain.innerHTML = "";
    profileMain.style.display = "block";
    let profile = document.createElement("div");
    profile.id = "profile";
    let userStats = await loggedInUser.getUserStats();
    if (!loggedInUser.profilePic) {
        await profilePicPicker();
    }
    profile.innerHTML = `
    <div id="profilePic">
        <img src="${loggedInUser.profilePic}">
    </div>
    <h1>${loggedInUser.username}</h1>
    <h2>Your stats</h2>
    <div id="profile-stats">
        <ul>
            <h3>Easy</h3>
            <li><b>Correct: </b>${userStats["easy"].correct}</li>
            <li><b>Answered: </b>${userStats["easy"].answered}</li>
        </ul>
        <ul>
            <h3>Medium</h3>
            <li><b>Correct: </b>${userStats["medium"].correct}</li>
            <li><b>Answered: </b>${userStats["medium"].answered}</li>
        </ul>
        <ul>
            <h3>Hard</h3>
            <li><b>Correct: </b>${userStats["hard"].correct}</li>
            <li><b>Answered: </b>${userStats["hard"].answered}</li>
        </ul>
    </div>
    <div id="profileManagement">
        <button class="profileButton" id="deleteAccount">Delete Account</button>
        <button class="profileButton" id="changePassword">Change Password</button>
        <button class="profileButton" id="logOut">Log Out</button>
    </div>
    `;
    profileMain.appendChild(profile);
    document.querySelector("#changePassword").addEventListener("click", async () => {
        changeOverlay.style.display = "flex";
        let oldPwd = document.querySelector("#change-old-password");
        let newPwd = document.querySelector("#change-new-password");
        let buttonAndStatus = document.querySelector("#change-button-and-status");
        buttonAndStatus.innerHTML = "";

        let submit = document.createElement("button");
        submit.id = "change-submit";
        submit.textContent = "Sumbit";
        submit.classList.add("submit");
        let status =  document.createElement("p");
        status.id = "change-status";
        status.textContent = "...";
        let back = document.createElement("button");
        back.id = "change-back";
        back.textContent = "Go Back";
        back.classList.add("profileButton");

        buttonAndStatus.appendChild(submit);
        buttonAndStatus.appendChild(status);
        buttonAndStatus.appendChild(back);

        back.addEventListener("click", () => {
            oldPwd.value = "";
            newPwd.value = "";
            document.querySelector("#change-status").textContent = "...";
            changeOverlay.style.display = "none";
        });

        submit.addEventListener("click", async () => {
            let req = new Request(`${websiteURL}/settings/changePassword`, {
                method: "PATCH",
                body: JSON.stringify({username: loggedInUser.username, password: oldPwd.value, newPassword: newPwd.value}),
                headers: {"content-type": "application/json"}
            });
            let resp = await fetch(req);
            let reso = await resp.json();
            if (resp.status === 200) {
                document.querySelector("#change-status").textContent = "Success!";
                loggedInUser = new User(reso);
                oldPwd.value = "";
                newPwd.value = "";
                setTimeout(() => {
                    document.querySelector("#change-status").textContent = "...";
                    changeOverlay.style.display = "none";
                }, 1500)
            } else {
                document.querySelector("#change-status").textContent = reso;
            } 
        });
    });
}


async function profilePicPicker() {
    profilePicOverlay.style.display = "flex";
    let themes = ["tiger", "parrot", "dog", "snail", "koala", "giraffe", "cat", "turtle", "penguin"];
    let num = Math.floor(Math.random() * themes.length);
    let req = new Request(`https://api.pexels.com/v1/search?query=${themes[num]}&per_page=5`, {
        headers: {"Authorization": neoPexelsAPIKey}
    });
    let resp = await fetch(req);
    let reso = await resp.json();
    if (!resp.ok) {
        console.log("ajdå");
        return;
    }
    let imageOptions = document.querySelector("#image-options");
    for (let img of reso.photos) {
        let div = document.createElement("div");
        div.innerHTML = `
        <img src="${img.src.medium}">
        `;
        imageOptions.appendChild(div);
        div.addEventListener("click", async () => {
            let req = new Request(`${websiteURL}/user/${loggedInUser.id}/profilePic`, {
                method: "PATCH",
                body: JSON.stringify({profilePic: div.children[0].src}),
                headers: {"content-type": "application/json"}
            });
            let resp = await fetch(req);
            if (resp.status !== 200) {
                console.log("something broke");
                return;
            }

            loggedInUser.profilePic = div.children[0].src;
            profilePicOverlay.style.display = "none";
            showProfile();
        });
    }
}


