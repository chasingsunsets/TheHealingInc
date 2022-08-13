const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../helpers/auth');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const Product = require('../models/Product');
const flashMessage = require('../helpers/messenger');

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
            flashMessage(res, 'success', "Quiz" + ' has been created!');
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
            Product.findAll()
                .then((products) => {
                    healthAreas = quizzes.area.split(",");
                    prodForHealthAreas = []
                    const forImmunity = {
                        id: 0,
                        prodName: "",
                        image: "",
                        description: "",
                        area: ""
                    }
                    const forEyes = {
                        id: 0,
                        prodName: "",
                        image: "",
                        description: "",
                        area: ""
                    }
                    const forGut = {
                        id: 0,
                        prodName: "",
                        image: "",
                        description: "",
                        area: ""
                    }
                    const forSkin = {
                        id: 0,
                        prodName: "",
                        image: "",
                        description: "",
                        area: ""
                    }

                    for (i in healthAreas) {
                        if (healthAreas[i] == "immunity") {
                            immunity = "Astragalus Root"
                            for (x in products) {
                                if (products[x].name == "Astragalus Root")
                                {
                                    posterURL = products[x].posterURL;
                                    prodID = products[x].id;
                                }
                            }
                            forImmunity["id"] = prodID
                            forImmunity["prodName"] = immunity
                            forImmunity["image"] = posterURL
                            forImmunity["description"] = "Its root is used for health care purposes. Commonly combined with other herbs, astragalus has been promoted as a dietary supplement for many conditions, including upper respiratory infections, allergic rhinitis (hay fever), asthma, chronic fatigue syndrome, and chronic kidney disease, among others."
                            forImmunity["area"] = "Immunity"
                            // prodForHealthAreas.push(immunity)
                            prodForHealthAreas.push(forImmunity);
                        }
                        else if (healthAreas[i] == "eyes") {
                            eyes = "Goji Berry"
                            for (x in products) {
                                if (products[x].name == "Goji Berry") {
                                    posterURL = products[x].posterURL;
                                    prodID = products[x].id;
                                }
                            }
                            forEyes["id"] = prodID
                            forEyes["prodName"] = eyes
                            forEyes["image"] = posterURL
                            forEyes["description"] = "Goji berries are also known as Lycium barbarum. The goji berry is native to Asia, and people in Asia have been using this brightly colored fruit for more than 2,000 years as a medicinal herb and food supplement. Goji berries are widely available for purchase in health food stores and online. One study reported in the American Academy of Optometry’s journal Optometry and Vision Science found that seniors who drank goji berry juice for 90 days increased zeaxanthin and other antioxidant levels significantly."
                            forEyes["area"] = "Eyes"
                            // prodForHealthAreas.push(eyes)
                            prodForHealthAreas.push(forEyes);
                        }
                        else if (healthAreas[i] == "gut") {
                            gut = "Dang Gui (Angelica Sinensis)"
                            for (x in products) {
                                if (products[x].name == "Dang Gui") {
                                    posterURL = products[x].posterURL;
                                    prodID = products[x].id;
                                }
                            }
                            forGut["id"] = prodID
                            forGut["prodName"] = gut
                            forGut["image"] = posterURL
                            forGut["description"] = "Dang Gui is one of the most commonly used herbs in the Chinese herbal system. It is primarily known as a “women’s herb,” though many men consume it as well. Most famously and importantly, it known as a superior blood tonic, and that is one reason women use so much of it. It is also used conjunctively as a “blood vitalizer,” meaning that it supports healthy blood circulation, especially in the abdomen and pelvic basin. Men and women benefit from superior circulation. Dang Gui is very widely used to help establish, support and maintain healthy menstrual balance in women. It also has analgesic and mild sedative (calming, relaxing) actions."
                            forGut["area"] = "Gut"
                            // prodForHealthAreas.push(gut)
                            prodForHealthAreas.push(forGut);
                        }
                        else if (healthAreas[i] == "skin") {
                            skin = "Red Date"
                            for (x in products) {
                                if (products[x].name == "Red Date") {
                                    posterURL = products[x].posterURL;
                                    prodID = products[x].id;
                                }
                            }
                            forSkin["id"] = prodID
                            forSkin["prodName"] = skin
                            forSkin["image"] = posterURL
                            forSkin["description"] = "According to Food Data central by USDA, every 100g of dried red dates has 218 mg of Vitamin C. Red dates are potent antioxidants. Due to high vitamin C content, this ingredient has been associated with health benefits such as wound healing, especially in Traditional Chinese Medicine. This remains to be true since scientific research also suggests that vitamin C helps to improve the absorption of iron into the body. This is particularly helpful during wound healing as the body may have lost some blood and needs to produce new red blood cells. "
                            forSkin["area"] = "Skin"
                            // prodForHealthAreas.push(skin)
                            prodForHealthAreas.push(forSkin);
                        }
                    }
                    console.log(prodForHealthAreas);
                    res.render('quiz/quizResult', { quizzes, products, prodForHealthAreas, prodLenght: prodForHealthAreas.length, layout: 'account' });
                })
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
            flashMessage(res, 'success', "Quiz" + ' has been updated!');
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
        flashMessage(res, 'success', "Quiz" + ' has been deleted!');
        res.redirect('/quiz/listQuizzes');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;