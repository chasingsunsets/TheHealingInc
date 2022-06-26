const express = require('express');
const router = express.Router();
const moment = require('moment');
const ensureAuthenticated = require('../helpers/auth');
const Quiz = require('../models/Quiz');

router.get('/quizResult/:id', ensureAuthenticated, (req, res) => {
    Quiz.findByPk(req.params.id)
        .then((quizzes) => {
            // pass object to listVideos.handlebar
            res.render('quiz/quizResult', { quizzes, layout: 'account' });
        })
        .catch(err => console.log(err));
});

router.get('/listQuizzes', (req, res) => {
    Quiz.findAll({
        where: { userId: req.user.id },
        // order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((quizzes) => {
            // pass object to listVideos.handlebar
            res.render('quiz/listQuizzes', { quizzes, layout: 'account' });
            // res.render('quiz/listQuizzes', { quizzes });
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
            quizName, age, supplements, area, userId
        }
    )
        .then((quiz) => {
            console.log(quiz.toJSON());
            res.redirect('/quiz/listQuizzes');
        })
        .catch(err => console.log(err))
});

router.get('/editQuiz/:id', ensureAuthenticated, (req, res) => {
    Quiz.findByPk(req.params.id)
        .then((quiz) => {
            res.render('quiz/editQuiz', { quiz });
        })
        .catch(err => console.log(err));
});

router.post('/editQuiz/:id', ensureAuthenticated, (req, res) => {
    let quizName = req.body.quizName;
    let age = req.body.age;
    let supplements = req.body.supplements;
    let area = req.body.area;
    Quiz.update(
        {
            quizName, age, supplements, area
        },
        { where: { id: req.params.id } }
    )
        .then((quiz) => {
            console.log(quiz[0] + ' quiz updated');
            res.redirect('/quiz/listQuizzes');
        })
        .catch(err => console.log(err));
});

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