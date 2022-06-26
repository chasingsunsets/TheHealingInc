const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Order = require('../models/Order');
const Product = require('../models/Product');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */
            User.hasMany(Quiz);
            User.hasMany(Order);
            Quiz.belongsTo(User);
            Order.belongsTo(User);
            Order.hasMany(Product);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};
module.exports = { setUpDB };