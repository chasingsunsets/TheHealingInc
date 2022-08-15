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
        payment: { type: Sequelize.STRING },
        address: { type: Sequelize.STRING },
        Vanaddress: { type: Sequelize.STRING },
    });

const CartItem = db.define('cartItem',
    {
        product: { type: Sequelize.STRING },
        amount: { type: Sequelize.INTEGER },
        price: { type: Sequelize.DECIMAL },
        totalprice: { type: Sequelize.DECIMAL },
        weight: { type: Sequelize.INTEGER },
        m_weight: { type: Sequelize.INTEGER },
        // discount: { type: Sequelize.DECIMAL },
    });


module.exports = { Order, OrderItem, CartItem };