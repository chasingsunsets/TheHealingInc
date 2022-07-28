const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create voucher table in MySQL Database
const Voucher = db.define('voucher',
    {
        vname: { type: Sequelize.STRING },
        discount: { type: Sequelize.INTEGER },
        minspend: { type: Sequelize.INTEGER },
        code: { type: Sequelize.STRING },
        valid: { type: Sequelize.DATE },
        use: { type: Sequelize.BOOLEAN }
    });
module.exports = Voucher;