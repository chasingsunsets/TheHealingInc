const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create quizzes table in MySQL Database
const Quiz = db.define('quiz',
    {
        quizName: { type: Sequelize.STRING },
        age: { type: Sequelize.DATE },
        tcmKnowledge: { type: Sequelize.STRING },
        supplements: { type: Sequelize.STRING },
    });
module.exports = Quiz;