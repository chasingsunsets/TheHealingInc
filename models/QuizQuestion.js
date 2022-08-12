const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create quizzes table in MySQL Database
const QuizQuestion = db.define('quizQuestion',
    {
        questionID: { type: Sequelize.INTEGER },
        questionString: { type: Sequelize.STRING },
    });

module.exports = QuizQuestion;