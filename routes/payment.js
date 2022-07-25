const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');

router.get('/payment', ensureAuthenticated, (req, res) => {
    console.log("get to payment page successfully")
    console.log('user id: ', req.user.id)
	Order.Order.findAll({
		where: { userId: req.user.id },
		order: [['createdat', 'DESC']],
	})
		.then((order) => {
			// pass object to cart.handlebars
			res.render('../views/cart/purchase.handlebars', { order });
		})
		.catch(err => console.log(err));
});

router.post('/payment', ensureAuthenticated, (req, res) => {
    console.log("get to payment page failed")
});













module.exports = router;