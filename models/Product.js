const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Product = db.define('product',
    {
        name: { type: Sequelize.STRING },
        posterURL: { type: Sequelize.STRING },
        stock: { type: Sequelize.INTEGER },
        weight: { type: Sequelize.INTEGER },
        price: { type: Sequelize.FLOAT },
        category: { type: Sequelize.STRING }
    });

module.exports = Product;