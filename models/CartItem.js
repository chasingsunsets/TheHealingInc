const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Cartitem = db.define('Cartitem',
    {
        ProductID: { type: Sequelize.INTEGER },
        price: { type: Sequelize.FLOAT },
        
    });

module.exports = Cartitem;