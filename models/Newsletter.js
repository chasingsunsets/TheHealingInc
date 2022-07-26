const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create newsletters table in MySQL Database
const Newsletter = db.define('newsletter',
    {
        newsletterName: { type: Sequelize.STRING },
        category: { type: Sequelize.STRING },
        htmlContent: { type: Sequelize.STRING },
        fileUpload: { type: Sequelize.STRING },
        status: { type: Sequelize.STRING },
        createdBy: { type: Sequelize.STRING }
    });

module.exports = Newsletter;