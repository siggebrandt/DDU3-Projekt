const websiteURL = window.location.origin; // använd dena variabel för websidans-URL, representerar localhost OCH serverlänken

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
