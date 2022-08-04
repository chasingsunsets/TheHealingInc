const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');

router.get('/payment/:id', ensureAuthenticated, (req, res) => {
	Order.Order.findByPk(req.params.id)
		.then((order) => {
			let orderId = order.id
			let status = order.status
			Order.OrderItem.findAll({
				where: { orderId },
				order: [['createdat', 'DESC']],
			})
				.then((orderItem) => {
					res.render('../views/cart/purchase.handlebars', { orderItem, status, orderId });
				})
		})
		.catch(err => console.log(err));
});

router.post('/payment/:id', ensureAuthenticated, async (req, res) => {
	if (req.body.cancel == 'cancel') {
		flashMessage(res, 'success', 'Order has canceled for you');
		let status = "Cancelled";
		const order = await Order.Order.findByPk(req.params.id);
		Order.update(
			{ status: status },
			{ where: { id: order.id } },
		)
		res.redirect('/user/listOrder')
	}
	res.redirect('/payment/payment_is_successful/' + req.params.id, "PAYMENT", "height=600,width=600,toolbar=no, menubar=no,scrollbars=no, resizeable=no,location=no,status=no");
});

router.get('/payment_card/:id', ensureAuthenticated, async (req, res) => {
	res.render('../views/cart/payment_card.handlebars', { layout: 'payment' })
});

router.post('/payment_card/:id', ensureAuthenticated, async (req, res) => {
	let payment = "Paid"
	Order.Order.update(
		{ payment: payment },
		{ where: {id: req.params.id }});
	res.redirect("/payment/payment_card_successful")
});

router.get('/payment_is_successful/:id', ensureAuthenticated, async (req, res) => {
	res.render('../views/cart/payment_is_successful.handlebars')
});

router.get('/payment_card_successful', ensureAuthenticated, (req, res) => {
	res.render('../views/cart/payment_card_successful.handlebars')
});














module.exports = router;