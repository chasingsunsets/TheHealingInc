const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create newsletters table in MySQL Database
const Newsletter = db.define('newsletter',
    {
        newsletterName: { type: Sequelize.STRING },
        purpose: { type: Sequelize.STRING },
        createdBy: { type: Sequelize.STRING },
        status: { type: Sequelize.BOOLEAN },
        fileUpload: { type: Sequelize.STRING },
    });

module.exports = Newsletter;