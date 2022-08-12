const express = require('express');
const router = express.Router();
const moment = require('moment');
const ensureAuthenticated = require('../helpers/auth');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');

// display questions
// QuizQuestion.findAll({
//     order: [['questionID']],
//     raw: true
// })
//     .then((quizquestions) => {
//         console.log(quizquestions)
//         // listOfQuestions = []
//         // for (let i in quizquestions) {
//         //     listOfQuestions.push(quizquestions[i].questionString)
//         //     question = quizquestions.questionString;
//         // }
//         // console.log(listOfQuestions);
//     })
//     .catch(err => console.log(err));

// c: add quiz
router.get('/addQuiz', ensureAuthenticated, (req, res) => {
    QuizQuestion.findAll({
        order: [['questionID']],
        raw: true
    })
        .then((quizquestions) => {
        // listOfQuestions = []
        // for (let i in quizquestions) {
        //     listOfQuestions.push(quizquestions[i].questionString)
        // }
        // console.log(listOfQuestions);
            res.render('quiz/addQuiz', 
                {
                    quizquestions, qn1: quizquestions[0].questionString, qn2: quizquestions[1].questionString, qn3: quizquestions[2].questionString
                    , qn4: quizquestions[3].questionString, qn5: quizquestions[4].questionString, qn6: quizquestions[5].questionString, qn7: quizquestions[6].questionString,
                    qn8: quizquestions[7].questionString, qn9: quizquestions[8].questionString, qn10: quizquestions[9].questionString
            });
        })
        .catch(err => console.log(err));
});

router.post('/addQuiz', ensureAuthenticated, (req, res) => {
    
    let quizName = req.body.quizName;
    let gender = req.body.gender;
    let age = req.body.age;
    let tcm = req.body.tcm;
    let supplements = req.body.supplements;
    let area = req.body.area === undefined ? '' : req.body.area.toString();
    let diet = req.body.diet;
    let medication = req.body.medication;
    let allergy = req.body.allergy === undefined ? '' : req.body.allergy.toString();
    let smoke = req.body.smoke;
    let userId = req.user.id;
    Quiz.create(
        {
            quizName, gender, age, tcm, supplements, area, diet, medication, allergy, smoke, userId
        }
    )
        .then((quiz) => {
            console.log(quiz.toJSON());
            res.redirect('/quiz/listQuizzes');
        })
        .catch(err => console.log(err))
});

// r: retrieve the list of quiz
router.get('/listQuizzes', ensureAuthenticated, (req, res) => {
    Quiz.findAll({
        where: { userId: req.user.id },
        // order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((quizzes) => {
            res.render('quiz/listQuizzes', { quizzes, layout: 'account' });
            // res.render('quiz/listQuizzes', { quizzes });
        })
        .catch(err => console.log(err));
});

// r: results page
router.get('/quizResult/:id', ensureAuthenticated, (req, res) => {
    Quiz.findByPk(req.params.id)
        .then((quizzes) => {
            // pass object to listVideos.handlebar
            res.render('quiz/quizResult', { quizzes, layout: 'account' });
        })
        .catch(err => console.log(err));
});

// u: edit the quiz
router.get('/editQuiz/:id', ensureAuthenticated, (req, res) => {
    Quiz.findByPk(req.params.id)
        .then((quiz) => {
            res.render('quiz/editQuiz', { quiz });
        })
        .catch(err => console.log(err));
});

router.post('/editQuiz/:id', ensureAuthenticated, (req, res) => {
    let quizName = req.body.quizName;
    let gender = req.body.gender;
    let age = req.body.age;
    let tcm = req.body.tcm;
    let supplements = req.body.supplements;
    let area = req.body.area === undefined ? '' : req.body.area.toString();
    let diet = req.body.diet;
    let medication = req.body.medication;
    let allergy = req.body.allergy === undefined ? '' : req.body.allergy.toString();
    let smoke = req.body.smoke;
    let userId = req.user.id;
    Quiz.update(
        {
            quizName, gender, age, tcm, supplements, area, diet, medication, allergy, smoke, userId
        },
        { where: { id: req.params.id } }
    )
        .then((quiz) => {
            console.log(quiz[0] + ' quiz updated');
            res.redirect('/quiz/listQuizzes');
        })
        .catch(err => console.log(err));
});

// d: delete the quiz
router.get('/deleteQUiz/:id', ensureAuthenticated, async function
    (req, res) {
    try {
        let quiz = await Quiz.findByPk(req.params.id);
        if (!quiz) {
            flashMessage(res, 'error', 'Quiz not found');
            res.redirect('/quiz/listQuizzes');
            return;
        }
        if (req.user.id != quiz.userId) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/quiz/listQuizzes');
            return;
        }
        let result = await Quiz.destroy({ where: { id: quiz.id } });
        console.log(result + ' quiz deleted');
        res.redirect('/quiz/listQuizzes');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;