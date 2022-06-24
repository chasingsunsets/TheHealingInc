const express = require('express');
const router = express.Router();
const moment = require('moment');
const ensureAuthenticated = require('../helpers/auth');
const Quiz = require('../models/Quiz');

router.get('/listQuizzes', (req, res) => {
    Quiz.findAll({
        where: { userId: req.user.id },
        // order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((quizzes) => {
            // pass object to listVideos.handlebar
            res.render('quiz/listQuizzes', { quizzes });
        })
        .catch(err => console.log(err));
});

router.get('/addQuiz', ensureAuthenticated, (req, res) => {
    res.render('quiz/addQuiz');
});

router.post('/addQuiz', ensureAuthenticated, (req, res) => {
    let quizName = req.body.quizName;
    let age = req.body.age;
    let supplements = req.body.supplements;
    let area = req.body.area;
    let userId = req.user.id;
    Quiz.create(
        {
            quizName,age,supplements, area, userId
        }
    )
        .then((quiz) => {
            console.log(quiz.toJSON());
            res.redirect('/quiz/listQuizzes');
        })
        .catch(err => console.log(err))
});
module.exports = router;