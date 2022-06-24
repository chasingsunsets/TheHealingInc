// (function () {
//     // Functions
//     function buildQuiz() {
//         // variable to store the HTML output
//         const output = [];

//         // for each question...
//         myQuestions.forEach(
//             (currentQuestion, questionNumber) => {

//                 // variable to store the list of possible answers
//                 const personalDetails = [];
//                 const answers = [];

//                 for (questions in currentQuestion.personalDetails) {

//                     // ...add an HTML radio button
//                     // change to input here!!!
//                     answers.push(
//                         `<label>
//                     <input type="radio" name="question${questionNumber}" value="${letter}">
//                     ${letter} :
//                     ${currentQuestion.answers[letter]}
//                     </label>`
//                     );
//                 }

//                 // and for each available answer...
//                 for (letter in currentQuestion.answers) {

//                     // ...add an HTML radio button
//                     // change to input here!!!
//                     answers.push(
//                     `<label>
//                     <input type="radio" name="question${questionNumber}" value="${letter}">
//                     ${letter} :
//                     ${currentQuestion.answers[letter]}
//                     </label>`
//                     );
//                 }

//                 // add this question and its answers to the output
//                 output.push(
//                 `<div class="slide">
//                 <div class="question"> ${currentQuestion.question} </div>
//                 <div class="answers"> ${answers.join("")} </div>
//                 </div>`
//                 );
//             }
//         );

//         // finally combine our output list into one string of HTML and put it on the page
//         quizContainer.innerHTML = output.join('');
//     }

//     function showResults() {

//         // gather answer containers from our quiz
//         const answerContainers = quizContainer.querySelectorAll('.answers');

//         // keep track of user's answers
//         let numCorrect = 0;

//         // for each question...
//         myQuestions.forEach((currentQuestion, questionNumber) => {

//             // find selected answer
//             const answerContainer = answerContainers[questionNumber];
//             const selector = `input[name=question${questionNumber}]:checked`;
//             const userAnswer = (answerContainer.querySelector(selector) || {}).value;

//             // if answer is correct
//             if (userAnswer === currentQuestion.correctAnswer) {
//                 // add to the number of correct answers
//                 numCorrect++;

//                 // color the answers green
//                 answerContainers[questionNumber].style.color = 'lightgreen';
//             }
//             // if answer is wrong or blank
//             else {
//                 // color the answers red
//                 answerContainers[questionNumber].style.color = 'red';
//             }
//         });

//         // show number of correct answers out of total
//         resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
//     }

//     function showSlide(n) {
//         slides[currentSlide].classList.remove('active-slide');
//         slides[n].classList.add('active-slide');
//         currentSlide = n;
//         if (currentSlide === 0) {
//             previousButton.style.display = 'none';
//         }
//         else {
//             previousButton.style.display = 'inline-block';
//         }
//         if (currentSlide === slides.length - 1) {
//             nextButton.style.display = 'none';
//             submitButton.style.display = 'inline-block';
//         }
//         else {
//             nextButton.style.display = 'inline-block';
//             submitButton.style.display = 'none';
//         }
//     }

//     function showNextSlide() {
//         showSlide(currentSlide + 1);
//     }

//     function showPreviousSlide() {
//         showSlide(currentSlide - 1);
//     }

//     // Variables
//     const quizContainer = document.getElementById('quiz');
//     const resultsContainer = document.getElementById('results');
//     const submitButton = document.getElementById('submit');
//     const myQuestions = [
//         {
//             question: "What's your first name (or nickname)?",
//             answers: {
//                 a: "Male",
//                 b: "Female",
//             },
//             correctAnswer: "a"
//         },
//         {
//             question: "What's your first name (or nickname)?",
//             answers: {
//                 a: "Male",
//                 b: "Female",
//             },
//             correctAnswer: "a"
//         },
//         {
//             question: "When it comes to Traditional Chinese Medicine, you",
//             answers: {
//                 a: "Know more than the average person.",
//                 b: "Know a bit, but want to learn more.",
//                 c: "Are not convinced yet."
//             },
//             correctAnswer: "c"
//         },
//         {
//             question: "Have you taken Traditional Chinese Medicine supplements in the past?",
//             answers: {
//                 a: "For a while",
//                 b: "On and off",
//                 c: "Never"
//             },
//             correctAnswer: "c"
//         },
//         {
//             question: "What sex were you assigned at birth?",
//             answers: {
//                 a: "Male",
//                 b: "Female",
//             },
//             correctAnswer: "a"
//         },
//     ];

//     // Kick things off
//     buildQuiz();

//     // Pagination
//     const previousButton = document.getElementById("previous");
//     const nextButton = document.getElementById("next");
//     const slides = document.querySelectorAll(".slide");
//     let currentSlide = 0;

//     // Show the first slide
//     showSlide(currentSlide);

//     // Event listeners
//     submitButton.addEventListener('click', showResults);
//     previousButton.addEventListener("click", showPreviousSlide);
//     nextButton.addEventListener("click", showNextSlide);

// })();

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
    if (!selectedOption){
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

function ensureOneCheck(checkBoxName, messageId, submitId) {
    const checkBoxes = $('[name=' + checkBoxName + ']');
    let checkCount = 0;
    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked)
            checkCount++;
    }
    if (checkCount === 0) {
        $('#' + messageId).show();
        $('#' + submitId).prop('disabled', true);
        return false;
    } else {
        $('#' + messageId).hide();
        $('#' + submitId).prop('disabled', false);
        return true;
    }
}
