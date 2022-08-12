const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');
const Newsletter = require('../models/Newsletter');
const Voucher = require('../models/Voucher');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */
            Subscription;
            Newsletter;
            // Voucher;
            
            User.hasMany(Quiz);
            Quiz.belongsTo(User);

            User.hasMany(Booking);
            Booking.belongsTo(User);

            User.hasMany(Order.CartItem);
            Order.CartItem.belongsTo(User);

            User.hasMany(Order.Order);

            Order.Order.hasMany(Order.OrderItem);
            Order.OrderItem.belongsTo(Order.Order);
            
            User.hasMany(Voucher.UserVoucher);
            Voucher.UserVoucher.belongsTo(User);

            // Voucher.UserVoucher.hasMany(Voucher.Voucher);
            // Voucher.Voucher.belongsTo(Voucher.UserVoucher);
            Voucher.Voucher.hasMany(Voucher.UserVoucher);
            Voucher.UserVoucher.belongsTo(Voucher.Voucher);
            

            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};
module.exports = { setUpDB };