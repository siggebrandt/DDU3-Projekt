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
    let quizProgress = 0;
    let correctAnswers = 0;

    let currentQuestions = new CreateQuestion(questions.questions[quizProgress]);

    console.log(currentQuestions);

    console.log(currentQuestions.question);    
    console.log(currentQuestions.choices);    


    function showQuestion () {
        const quizQuestion = document.getElementById("quizQuestion");
        const quizChoices = document.getElementById("quizChoices");
        quizChoices.innerHTML = "";

        quizQuestion.innerHTML = currentQuestions.question;
        currentQuestions.choices.forEach(choice => {
            quizChoices.innerHTML += `
            <div class="quizAnswerButton">${choice}</div>
            `
        })
        /* quizChoices.innerHTML = `
        <div id="answerOne" class="quizAnswerButton">one
        </div>
        <div id="answerTwo" class="quizAnswerButton">two
        </div>
        <div id="answerThree" class="quizAnswerButton">three
        </div>
        <div id="answerFour" class="quizAnswerButton">four
        </div>
        ` */
    }
    showQuestion();
    
}
async function leaderboard() {
    const response = await fetch("http://localhost:8000/users");
    const users = await response.json();
    const leaderboardMain = document.querySelector("#leaderboardMain");
    for(let user of users){
        const easyScore = user.score.easy;
        const mediumScore = user.score.medium;
        const hardScore = user.score.hard;
        const userDiv = document.createElement("div");
        const usernameDOM = document.createElement("p");
        const userScore = document.createElement("div");

        leaderboardMain.appendChild(userDiv);
        userDiv.appendChild(usernameDOM);
        userDiv.classList.add("user")
        usernameDOM.textContent = user.username;
        userDiv.appendChild(userScore)
        userScore.classList.add("userScores")


        const circleEasy = document.createElement("div");
        circleEasy.classList.add("scoreCircle");
        circleEasy.style.backgroundColor = `rgba(0, 150, 0, ${easyScore})`;
        userScore.appendChild(circleEasy)

        const circleMedium = document.createElement("div")
        circleMedium.classList.add("scoreCircle");
        circleMedium.style.backgroundColor = `rgba(255, 200, 0, ${mediumScore})`;
        userScore.appendChild(circleMedium)

        const circleHard = document.createElement("div")
        circleHard.classList.add("scoreCircle");
        circleHard.style.backgroundColor = `rgba(150, 0, 0, ${hardScore})`;
        userScore.appendChild(circleHard)

    }
}
leaderboard()