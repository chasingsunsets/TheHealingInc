const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create subscribers table in MySQL Database
const Subscriber = db.define('subscriber',
    {
        firstname: { type: Sequelize.STRING },
        lastname: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        verified: { type: Sequelize.BOOLEAN },
    });

const Newsletter = db.define('newsletter',
    {
        name: { type: Sequelize.STRING },
    });

module.exports = Subscriber, Newsletter;