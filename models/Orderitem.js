const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create Order table in MySQL Database
const OrderItem = db.define('orderitem',
    {
        ProdcutID: { type: Sequelize.INTEGER},
        Quanity: { type: Sequelize.STRING },
    });

module.exports = OrderItem;