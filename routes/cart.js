const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');

router.get('/cart', ensureAuthenticated, (req, res) => {
	Order.findAll({
		where: { custID: req.user.id },
		order: [['createdat', 'DESC']],
		raw: true
	})
		.then((order) => {
			console.log(order.custID);
			console.log(order);
			// pass object to cart.handlebars
			res.render('../views/cart/cart.handlebars', { order });
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

// router.post('/editOrder/:id', ensureAuthenticated, (req, res) => {
// 	let custno = req.user.custno;
// 	let product = req.body.product;
// 	let amount = req.body.amount;
// 	let price = req.body.price;

// 	Order.update(
// 		{custno, product, amount, price},
// 		{where: {id: req.params.id}}
// 	)
// 		.then((result) =>{
// 			console.log('order' + '(' + result[0]+ ')' + 'updated');
// 			res.redirect('../views/cart/cart.handlebars', { orders });
// 		})

// });

router.post('editcart',(req, res, next) => {
	console.log('order' + '(' + req.params.id + ')' + 'updated');
})






module.exports = router;