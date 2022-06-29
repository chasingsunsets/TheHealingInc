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


router.post('/cart', ensureAuthenticated, async (req, res) => {
	const item_id = await Order.findByPk(req.body.item_id);
	if (req.body.minus == "minus") {
		const amount = parseInt(req.body.amount) - 1
		if (parseInt(req.body.amount) < 1){
			let result = await Order.destroy({ where: { id: item_id.id } });
			res.redirect('/cart/cart')
		}
		await item_id.update({
			product: req.body.product,
			amount: amount,
			price: req.body.price
		})
	} 
	else if (req.body.plus == "plus") {
		const amount = parseInt(req.body.amount) + 1
		await item_id.update({
			product: req.body.product,
			amount: amount,
			price: req.body.price
		})
	}
	return res.redirect('/cart/cart');

});

router.get('/editOrder/:id', ensureAuthenticated, (req, res) => {
	Order.findByPk(req.params.id)
		.then((order) => {
			res.render('../views/cart/editorder.handlebars', { order });
		})
		.catch(err => console.log(err));
});










module.exports = router;