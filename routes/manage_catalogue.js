const express = require('express');
const manage_catalogue = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');
// const { where } = require('sequelize/types');
manage_catalogue.get('/', (req, res) => {
	res.render('./product/catalogue');
})
manage_catalogue.post('/',async (req, res) => {
	// let custno = req.user.custno;
	// let product = req.body.product;
	// let amount = req.body.amount;
	// let price = req.body.price;

	let custID = req.user.id;
	let product = "TCM#1";
	let amount = 1;
	let price = 100.00;

	Order.create(
		{ custID, product, amount, price }
	)
		.then((order) => {
			console.log(order.toJSON());
			req.flash('success','suvk dick')
			res.redirect('/catalogue');
		})
		.catch(err => console.log(err));
});


module.exports = manage_catalogue;