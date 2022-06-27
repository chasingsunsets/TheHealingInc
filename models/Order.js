const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create Order table in MySQL Database
const Order = db.define('order',
    {
        custID: { type: Sequelize.INTEGER},
        product: { type: Sequelize.STRING },
        amount: { type: Sequelize.INTEGER },
        price: { type: Sequelize.FLOAT },
    });

module.exports = Order;