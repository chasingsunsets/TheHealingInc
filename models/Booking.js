const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Booking = db.define('booking',
    {
        name: { type: Sequelize.STRING },
        dateRelease: { type: Sequelize.DATE },
        email: { type: Sequelize.STRING },
        contactno: { type: Sequelize.STRING },
        service: { type: Sequelize.STRING }
    });

module.exports = Booking;