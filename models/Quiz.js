const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create quizzes table in MySQL Database
const Quiz = db.define('quiz',
    {
        quizName: { type: Sequelize.STRING },
        gender: { type: Sequelize.STRING },
        age: { type: Sequelize.STRING },
        tcm: { type: Sequelize.STRING },
        supplements: { type: Sequelize.STRING },
        area: {type: Sequelize.STRING},
        diet: { type: Sequelize.STRING },
        medication: { type: Sequelize.STRING },
        allergy: { type: Sequelize.STRING },
        smoke: { type: Sequelize.STRING },
    });
module.exports = Quiz;