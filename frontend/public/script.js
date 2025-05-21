const websiteURL = "http:localhost:8000"; // använd dena variabel för websidans-URL, representerar localhost OCH serverlänken

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
                .replace(/&ntilde;/g, "ñ");
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
const leaderboardMain = document.querySelector("#leaderboardMain");

loginMain.style.display = "none";
registerMain.style.display = "none";
quizMain.style.display = "none";
leaderboardMain.style.display = "none";

// Login 
const loginButtonNav = document.getElementById("loginButton");
loginButtonNav.addEventListener("click", () => {
    homepageMain.style.display = "none";
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
    console.log(questions);
    for(let i = 0; i < questions.length;)
    {
        let button = document.createElement("div");
        button.classList("quizOption");
    }
}