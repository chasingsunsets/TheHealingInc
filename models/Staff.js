const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const Staff = db.define('staff',
    {
        staffno: { type: Sequelize.STRING },
        username: { type: Sequelize.STRING },
        firstname: { type: Sequelize.STRING },
        lastname: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        password: { type: Sequelize.STRING }
    });
module.exports = Staff;