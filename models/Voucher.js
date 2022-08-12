const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create voucher table in MySQL Database
const Voucher = db.define('voucher',
    {
        vname: { type: Sequelize.STRING },
        discount: { type: Sequelize.INTEGER },
        dtype: { type: Sequelize.STRING },
        minspend: { type: Sequelize.INTEGER },
        code: { type: Sequelize.STRING },
        limituse:{ type: Sequelize.INTEGER },
        usecount: { type: Sequelize.INTEGER },
        valid: { type: Sequelize.DATE },
        displaydate: { type: Sequelize.STRING },
        // expire: { type: Sequelize.BOOLEAN },
        invalidtype:{ type: Sequelize.STRING }, //expired, max use count, deleted
    });

const UserVoucher = db.define('uservoucher',
    {
        vname: { type: Sequelize.STRING },
        discount: { type: Sequelize.INTEGER },
        dtype: { type: Sequelize.STRING },
        minspend: { type: Sequelize.INTEGER },
        code: { type: Sequelize.STRING },
        valid: { type: Sequelize.DATE },
        displaydate: { type: Sequelize.STRING },
        invalidtype:{ type: Sequelize.STRING },
        // expire: { type: Sequelize.BOOLEAN },
        use: { type: Sequelize.BOOLEAN }
    });

module.exports = { Voucher, UserVoucher};