const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');

router.get('/cart', ensureAuthenticated, (req, res) => {
	Order.CartItem.findAll({
		where: { custID: req.user.id },
		order: [['createdat', 'DESC']],
		raw: true
	})
		.then((cartItem) => {
			console.log(cartItem.custID);
			console.log(cartItem);
			// pass object to cart.handlebars
			res.render('../views/cart/cart.handlebars', { cartItem });
		})
		.catch(err => console.log(err));
});


router.post('/cart', ensureAuthenticated, async (req, res) => {
	let item_id = await Order.findByPk(req.body.item_id);
	if (req.body.minus == "minus") {
		const amount = parseInt(req.body.amount)
		if (amount <= 1) {
			flashMessage(res, 'success', 'Product has deleted for you');
			await Order.destroy({ where: { id: item_id.id } });
		}
		else {
			const new_amount = amount - 1;
			const price = parseFloat(req.body.totalprice) - parseFloat(req.body.price);
			await item_id.update({
				product: req.body.product,
				amount: new_amount,
				totalprice: price
			})
		}
	}
	else if (req.body.plus == "plus") {
		const amount = parseInt(req.body.amount) + 1
		const price = parseFloat(req.body.totalprice) + parseFloat(req.body.price);
		await item_id.update({
			product: req.body.product,
			amount: amount,
			totalprice: price
		})
	}
	else if (req.body.deleteitem == "deleteitem") {
		flashMessage(res, 'success', 'Product successfully deleted');
		await Order.destroy({ where: { id: item_id.id } });
	}
	return res.redirect('/cart/cart');

});










module.exports = router;