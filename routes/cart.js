const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');
// const { where } = require('sequelize/types');


router.get('/cart', (req, res) => {
	res.render('../views/cart/cart.handlebars');
});

router.post('/addorder', ensureAuthenticated, (req, res) => {
	let custno = req.user.custno;
	let product = req.body.product;
	let amount = req.body.amount;
	let price = req.body.price;

	Order.create(
		{ custno, product, amount, price }
	)
		.then((order) => {
			console.log(order.toJSON());
			res.redirect('../views/product/catalogue.handlebars');
		})
		.catch(err => console.log(err));
});

router.get('/listOrder', ensureAuthenticated, (req, res) => {
	Order.findall({
		where: { custno: req.user.custno },
		order: [['database', 'DESC']],
		raw: true
	})
		.then((orders) => {
			// pass object to cart.handlebars
			res.render('../views/cart/cart.handlebars', { orders });
		})
		.catch(err => console.log(err));
});

router.get('/editOrder/:id', ensureAuthenticated, (req, res) => {
	Video.findByPk(req.params.id)
		.then((order) => {
			res.render('../views/cart/editorder.handlebars', { order });
		})
		.catch(err => console.log(err));
});

router.post('/editOrder/:id', ensureAuthenticated, (req, res) => {
	let custno = req.user.custno;
	let product = req.body.product;
	let amount = req.body.amount;
	let price = req.body.price;

	Order.update(
		{custno, product, amount, price},
		{where: {id: req.params.id}}
	)
		.then((result) =>{
			console.log('order' + '(' + result[0]+ ')' + 'updated');
			res.redirect('../views/cart/cart.handlebars', { orders });
		})

});








module.exports = router;