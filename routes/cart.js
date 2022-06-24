const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');


router.get('/cart', (req, res) => {
	res.render('../views/cart/cart.handlebars');
});

router.post('/addorder', (req, res) => {
	let custno = req.user.custno;
	let product = req.body.product;
	let amount = req.body.amount;
	let price = req.body.price;

	Order.create(
		{custno, product, amount, price}
	)
		.then((order) => {
			console.log(order.toJSON());
			res.redirect('../views/product/catalogue.handlebars');
		})
		.catch(err => console.log(err));
});

router.get('/listOrder', (req, res) => {
	Order.findall({
		where: { custno: req.user.custno},
		order: [['database', 'DESC']],
		raw: true
	})
		.then((orders) => {
			res.render('../views/cart/cart.handlebars', {orders});
		})
		.catch(err => console.log(err));
});









module.exports = router;