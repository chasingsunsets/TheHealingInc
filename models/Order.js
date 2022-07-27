const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create Order table in MySQL Database


const OrderItem = db.define('orderItem',
    {
        product: { type: Sequelize.STRING },
        amount: { type: Sequelize.INTEGER },
        price: { type: Sequelize.FLOAT },
    });

const Order = db.define('order',
    {
        totalamount: { type: Sequelize.DECIMAL },
        status: { type: Sequelize.STRING },
        payment: { type: Sequelize.INTEGER },
    });

const CartItem = db.define('cartItem',
    {
        product: { type: Sequelize.STRING },
        amount: { type: Sequelize.INTEGER },
        price: { type: Sequelize.DECIMAL },
        totalprice: { type: Sequelize.DECIMAL },
    });


module.exports = { Order, OrderItem, CartItem };