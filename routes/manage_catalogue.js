const express = require('express');
const manage_catalogue = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');
const { success } = require('flash-messenger/Alert');
// const { where } = require('sequelize/types');
manage_catalogue.get('/', (req, res) => {
	res.render('./product/catalogue');
})
manage_catalogue.post('/', async (req, res) => {
	// let custno = req.user.custno;
	// let product = req.body.product;
	// let amount = req.body.amount;
	// let price = req.body.price;

	// test data
	let custID = req.user.id;
	let product = "TCM#1";
	let amount = 1;
	let price = 100.00;
	let totalprice = 100.00;

	// let cart = "TCM#1";
	// if (product == cart) {
	// 	let item_id = await Order.findByPk(req.user.id);
	// 	const amount = parseInt(req.body.amount) + 1
	// 	await user_id.update({
	// 		product: req.body.product,
	// 		amount: amount,
	// 		price: req.body.price
	// 	})
	// 	res.redirect('/catalogue');
	// }
	// else {
	Order.CartItem.create(
		{ custID, product, amount, price, totalprice }
	)
		.then((order) => {
			console.log(order.toJSON());
			res.redirect('/catalogue');
		})
		.catch(err => console.log(err));
	// }


});


module.exports = manage_catalogue;