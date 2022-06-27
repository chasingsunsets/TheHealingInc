// For: createQuiz
const questions = [
    {
        "question": "When it comes to traditional chinese medicine, you:",
        "answer1": "Know more than the average person.",
        "answer1Total": "1",
        "answer2": "Know a bit, but want to learn more.",
        "answer2Total": "2",
        "answer3": "Are not convinced yet.",
        "answer3Total": "3"
    },
    {
        "question": "Have you taken supplements/ traditional chinese medicine in the past?",
        "answer1": "For a while",
        "answer1Total": "1",
        "answer2": "On and Off",
        "answer2Total": "2",
        "answer3": "Never",
        "answer3Total": "3"
    },
    {
        "question": "Which areas of health are you looking to improve?",
        "answer1": "Immunity",
        "answer1Total": "1",
        "answer2": "Hair",
        "answer2Total": "3",
        "answer3": "Stress",
        "answer3Total": "2"
    },
    {
        "question": "What about your hair?",
        "answer1": "Dryness",
        "answer1Total": "3",
        "answer2": "Thinning",
        "answer2Total": "2",
        "answer3": "Slow growth",
        "answer3Total": "1"
    },
    {
        "question": "How stressed have you been in the last month?",
        "answer1": "Very low",
        "answer1Total": "1",
        "answer2": "Low",
        "answer2Total": "2",
        "answer3": "Moderate",
        "answer3Total": "3"
    },
    {
        "question": "How often do you feel stressed?",
        "answer1": "Less than once a month",
        "answer1Total": "1",
        "answer2": "Once or twice a month",
        "answer2Total": "2",
        "answer3": "About once or twice peer week",
        "answer3Total": "3"
    },
    {
        "question": "In relation to colds, flu and infections - how often do you feel unwell each year?",
        "answer1": "More than 4 times",
        "answer1Total": "1",
        "answer2": "2-3 times",
        "answer2Total": "2",
        "answer3": "Rarely",
        "answer3Total": "3"
    },
    {
        "question": "Have you taken antibiotics in the past 4 years?",
        "answer1": "Yes",
        "answer1Total": "1",
        "answer2": "No",
        "answer2Total": "2",
        "answer3": "Not sure",
        "answer3Total": "3"
    },
]


let currentQuestion = 0;
let score = [];
let selectedAnswersData = [];
const totalQuestions = questions.length;


const container = document.querySelector('.quiz-container');
const questionEl = document.querySelector('.question');
const option1 = document.querySelector('.option1');
const option2 = document.querySelector('.option2');
const option3 = document.querySelector('.option3');
const nextButton = document.querySelector('.next');
const previousButton = document.querySelector('.previous');
const restartButton = document.querySelector('.restart');
const result = document.querySelector('.result');

//Function to generate question 
function generateQuestions(index) {
    //Select each question by passing it a particular index
    const question = questions[index];
    const option1Total = questions[index].answer1Total;
    const option2Total = questions[index].answer2Total;
    const option3Total = questions[index].answer3Total;
    //Populate html elements 
    questionEl.innerHTML = `${index + 1}. ${question.question}`
    option1.setAttribute('data-total', `${option1Total}`);
    option2.setAttribute('data-total', `${option2Total}`);
    option3.setAttribute('data-total', `${option3Total}`);
    option1.innerHTML = `${question.answer1}`
    option2.innerHTML = `${question.answer2}`
    option3.innerHTML = `${question.answer3}`

}

function loadNextQuestion() {
    const selectedOption = document.querySelector('input[type="radio"]:checked');
    //Check if there is a radio input checked
    if (!selectedOption) {
        alert('Please select your answer!');
        return;
    }
    //Get value of selected radio
    const answerScore = Number(selectedOption.nextElementSibling.getAttribute('data-total'));

    ////Add the answer score to the score array
    score.push(answerScore);

    selectedAnswersData.push()


    const totalScore = score.reduce((total, currentNum) => total + currentNum);

    //Finally we incement the current question number ( to be used as the index for each array)
    currentQuestion++;

    //once finished clear checked
    selectedOption.checked = false;
    //If quiz is on the final question
    if (currentQuestion == totalQuestions - 1) {
        nextButton.textContent = 'Finish';
    }
    //If the quiz is finished then we hide the questions container and show the results 
    if (currentQuestion == totalQuestions) {
        container.style.display = 'none';
        result.innerHTML =
            `<h1 class="final-score">Your score: ${totalScore}</h1>
         <div class="summary">
            <h1>Summary</h1>
            <p>Possible - Personality Traits, see below for a summary based on your results:</p>
            <p>15 - 21- You Need Help</p>
            <p>10 - 15 - Good Soul</p>
            <p>5 - 10 - Meh </p>
            <p>5 - Are You Even Real</p>
        </div>
        <button class="restart">Restart Quiz</button>
         `;
        return;
    }
    generateQuestions(currentQuestion);
}

//Function to load previous question
function loadPreviousQuestion() {
    //Decrement quentions index
    currentQuestion--;
    //remove last array value;
    score.pop();
    //Generate the question
    generateQuestions(currentQuestion);
}

//Fuction to reset and restart the quiz;
function restartQuiz(e) {
    if (e.target.matches('button')) {
        //reset array index and score
        currentQuestion = 0;
        score = [];
        //Reload quiz to the start
        location.reload();
    }

}

generateQuestions(currentQuestion);
nextButton.addEventListener('click', loadNextQuestion);
previousButton.addEventListener('click', loadPreviousQuestion);
result.addEventListener('click', restartQuiz);

function initialiseFirstname() {
    let firstname = $('#firstname').val();
    let titleArr = [];
    let initTitle = '';
    if (firstname) {
        titleArr = firstname.trim().split(' ');
        for (let i = 0; i < titleArr.length; i++) {
            initTitle += titleArr[i].charAt(0).toUpperCase() + titleArr[i].slice(1) + (i == titleArr.length - 1 ? '' : ' ');
        }
        $('#firstname').val(initTitle);
    }
}

function initialiseLastname() {
    let lastname = $('#lastname').val();
    let titleArr = [];
    let initTitle = '';
    if (lastname) {
        titleArr = lastname.trim().split(' ');
        for (let i = 0; i < titleArr.length; i++) {
            initTitle += titleArr[i].charAt(0).toUpperCase() + titleArr[i].slice(1) + (i == titleArr.length - 1 ? '' : ' ');
        }
        $('#lastname').val(initTitle);
    }
}

function initialiseAddress() {
    let address = $('#address').val();
    let titleArr = [];
    let initTitle = '';
    if (address) {
        titleArr = address.trim().split(' ');
        for (let i = 0; i < titleArr.length; i++) {
            initTitle += titleArr[i].charAt(0).toUpperCase() + titleArr[i].slice(1) + (i == titleArr.length - 1 ? '' : ' ');
        }
        $('#address').val(initTitle);
    }
}
