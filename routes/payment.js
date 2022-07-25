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
	Order.Order.findOne({
		where: { userId: req.user.id },
		order: [['createdat', 'DESC']],
	})
		.then((order) => {
			let orderId = order.id
			Order.OrderItem.findAll({
				where: { orderId },
				order: [['createdat', 'DESC']],
			})
				.then((orderItem) => {
					res.render('../views/cart/purchase.handlebars', { orderItem });
				})
		})
		.catch(err => console.log(err));
});

router.post('/payment', ensureAuthenticated, async (req, res) => {
	let order = await Order.Order.findOne({where: { userId: req.user.id },order: [['createdat', 'DESC']],})
	console.log("ORder: " + order.id);
	if (req.body.cancel == 'cancel') {
		flashMessage(res, 'success', 'Order has canceled for you');
		await Order.Order.destroy({ where: { id: order.id } });
		await Order.OrderItem.destroy({ where: { id: order.id} });
		res.redirect('/');
	}
});













module.exports = router;