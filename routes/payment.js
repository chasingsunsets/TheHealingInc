const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');

router.get('/payment/:id', ensureAuthenticated, (req, res) => {
	console.log("get to payment page successfully")
	console.log('user id: ', req.user.id)
	Order.Order.findByPk(req.params.id)
		.then((order) => {
			let orderId = order.id
			let status = order.status
			Order.OrderItem.findAll({
				where: { orderId },
				order: [['createdat', 'DESC']],
			})
				.then((orderItem) => {
					res.render('../views/cart/purchase.handlebars', { orderItem, status });
				})
		})
		.catch(err => console.log(err));
});

router.post('/payment/:id', ensureAuthenticated, async (req, res) => {
	let order = await Order.Order.findByPk(req.params.id)
	console.log("ORder: " + order.id);
	if (req.body.cancel == 'cancel') {
		flashMessage(res, 'success', 'Order has canceled for you');
		await Order.Order.destroy({ where: { id: order.id } });
		await Order.OrderItem.destroy({ where: { id: order.id} });
		res.redirect('/');
	}
});

router.get('/payment_card', ensureAuthenticated, async (req, res) => {
	res.render('../views/cart/payment_card.handlebars')
});













module.exports = router;