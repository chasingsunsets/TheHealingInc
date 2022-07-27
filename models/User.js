const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const User = db.define('user',
    {
        type: { type: Sequelize.STRING },
        firstname: { type: Sequelize.STRING },
        lastname: { type: Sequelize.STRING },
        username: { type: Sequelize.STRING },
        phoneno: { type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        verified: { type: Sequelize.BOOLEAN },
        password: { type: Sequelize.STRING },
    });
module.exports = User;