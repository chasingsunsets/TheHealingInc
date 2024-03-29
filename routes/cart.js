const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');
const { response, request } = require('express');
const Voucher = require('../models/Voucher');


router.get('/cart', ensureAuthenticated, (req, res) => {
	Order.CartItem.findAll({
		where: { userId: req.user.id },
		order: [['createdat', 'DESC']],
		// raw: true
	})
		.then((cartItem) => {
			// pass object to cart.handlebars
			res.render('../views/cart/cart.handlebars', { cartItem });
		})
		.catch(err => console.log(err));
});


router.post('/cart', ensureAuthenticated, async (req, res) => {
	let item_id = await Order.CartItem.findByPk(req.body.item_id);

	//////////////////////////////////////////////////////////////add voucher to uservoucherdb
	await Voucher.Voucher.findAll({
		where: { invalidtype: "valid" }
	})
		.then((voucher) => {
			// console.log(voucher)
			voucher.forEach(element => {
				let id = element.id;
				let userId = req.user.id;
				let voucherId = element.id
				let vname = element.vname
				let dtype = element.dtype
				let discount = element.discount
				let minspend = element.minspend
				let code = element.code
				let usecount = element.usecount;
				let limituse = element.limituse;
				let valid = element.valid;
				let invalidtype = element.invalidtype;
				let displaydate = moment(valid).utc().format('DD/MM/YYYY');
				let displaytoday = moment().utc().format('DD/MM/YYYY');
				if (usecount >= limituse) {
					Voucher.Voucher.update(
						{ invalidtype: "Max Usage" },
						{ where: { id: id } }
					)

					Voucher.UserVoucher.findAll({
						where: { voucherId: id, invalidtype: "valid" },
					})
						.then((uservoucher) => {
							console.log("editing voucher for user side");
							uservoucher.forEach(element => {
								// let userId = element.userId;
								let voucherId = element.voucherId;

								Voucher.UserVoucher.update(
									{ invalidtype: "Max Usage" },
									{ where: { voucherId: voucherId } }
								)
									.then((result) => {
										console.log('user voucher updated');
									})
									.catch(err => console.log(err));

							});
						})
				}

				else if (!(displaytoday < displaydate)) {
					Voucher.Voucher.update(
						{ invalidtype: "Expired" },
						{ where: { id: id } }
					)

					Voucher.UserVoucher.findAll({
						where: { voucherId: id, invalidtype: "valid" },
					})
						.then((uservoucher) => {
							console.log("editing voucher for user side");
							uservoucher.forEach(element => {
								let voucherId = element.voucherId;

								Voucher.UserVoucher.update(
									{ invalidtype: "Expired" },
									{ where: { voucherId: voucherId } }
								)
									.then((result) => {
										console.log('user voucher updated');
									})
									.catch(err => console.log(err));

							});
						})
				}

				else {
					Voucher.UserVoucher.findOrCreate({
						where: { userId: userId, voucherId: voucherId },
						defaults: {
							vname,
							dtype,
							discount,
							minspend,
							code,
							valid,
							invalidtype,
							use: 0,
							userId,
							voucherId
						}
					});

				}


			})
		})
		.catch(err => console.log(err));
	//////////////////////////////////////////////////////////////////^add voucher to uservoucher db

	if (req.body.minus == "minus") {
		const amount = parseInt(req.body.amount)
		if (amount <= 1) {
			flashMessage(res, 'success', 'Product has been deleted for you');
			await Order.CartItem.destroy({ where: { id: item_id.id } });
			res.redirect('/cart/cart');
		}
		else {
			const new_amount = amount - 1;
			const price = parseFloat(req.body.totalprice) - parseFloat(req.body.price);
			const weight = parseFloat(req.body.weight) - parseFloat(req.body.m_weight);
			await item_id.update({
				product: req.body.product,
				amount: new_amount,
				totalprice: price,
				weight: weight
			})
			res.redirect('/cart/cart');
		}
	}
	else if (req.body.plus == "plus") {
		const amount = parseInt(req.body.amount) + 1
		const price = parseFloat(req.body.totalprice) + parseFloat(req.body.price);
		const weight = parseFloat(req.body.weight) + parseFloat(req.body.m_weight);
		await item_id.update({
			product: req.body.product,
			amount: amount,
			totalprice: price,
			weight: weight
		})
		res.redirect('/cart/cart');
	}
	else if (req.body.deleteitem == "deleteitem") {
		flashMessage(res, 'success', 'Product successfully deleted');
		await Order.CartItem.destroy({ where: { id: item_id.id } });
		res.redirect('/cart/cart');
	}

	else if (req.body.apply == 'apply') {        ///////////////////////////////////////apply voucher
		console.log("apply")
		if (req.body.sum2 == 0) {
			flashMessage(res, 'error', 'There is no product in the cart');
			res.redirect('/cart/cart');
		}

		else if (req.body.code.length == 0) {
			console.log("no code")
			flashMessage(res, 'error', 'No code entered');
			res.redirect('/cart/cart');
		}

		else {
			let totalamountforvoucher = req.body.totalamountforvoucher;

			uservoucher = await Voucher.UserVoucher.findOne({ where: { code: req.body.code, use: 0 } });
			if (!uservoucher) {
				console.log("invalid")
				flashMessage(res, 'error', 'Invalid Voucher');
				res.redirect('/cart/cart');
			}

			if (uservoucher) {
				console.log("totalamt:" + totalamountforvoucher)
				console.log("minspend:" + uservoucher.minspend)
				console.log(parseFloat(totalamountforvoucher) + " " + parseFloat(uservoucher.minspend))

				if (parseFloat(totalamountforvoucher) < parseFloat(uservoucher.minspend)) {
					console.log(parseFloat(totalamountforvoucher) + " " + parseFloat(uservoucher.minspend))
					flashMessage(res, 'error', 'Minimum spend of' + ' $' + parseFloat(uservoucher.minspend) + " to use the voucher: '" + uservoucher.code + "'");
					res.redirect('/cart/cart');
				}

				else {
					res.redirect('/cart/cartForVoucher/' + req.body.code);
					// let pricecount = 0;
					// let shippingcount = 0;
					// Order.CartItem.findAll({
					// 	where: { userId: req.user.id },
					// 	order: [['createdat', 'DESC']],
					// 	// raw: true
					// })
					// 	.then((cartItem) => {

					// 		cartItem.forEach(element => {
					// 			let price = element.totalprice;
					// 			let shipping = element.weight;



					// 			console.log("voucher applied");
					// 			pricecount = parseFloat(pricecount) + parseFloat(price) * 1.07;
					// 			shippingcount = parseFloat(shippingcount) + parseFloat(shipping);
					// 			console.log("pricecount " + pricecount);

					// 		});
					// 		let totaltotal = parseFloat(pricecount) + 12
					// 		res.render('../views/cart/cartvoucher.handlebars', { cartItem, uservoucher, pricecount, totaltotal });
					// 	})
					// 	.catch(err => console.log(err));
				}


			}


		}
	}                                                  ////////////////////////////////apply voucher

	else if (req.body.checkout == 'checkout') {
		if (req.body.sum == 0 && req.body.sum2 == 0) {
			flashMessage(res, 'error', 'There is no product in the cart');
			res.redirect('/cart/cart');
		}
		else {
			if (req.body.final != null) {
				console.log("final price:" + req.body.final);
				let userId = req.user.id;
				let totalamount = req.body.final; //final price with voucher
				let status = "Unshipped";
				let payment = "Unpaid";
				let address = req.body.address;
				let Vanaddress = "30 Jalan Kilang Barat Singapore 159363";
				console.log("address: " + address);
				Order.Order.create({ totalamount:req.body.final, userId, status, payment, address, Vanaddress })
					.then(() => {
						Order.Order.findOne({
							where: { userId },
							order: [['createdAt', 'DESC']],
							raw: true
						})
							.then((order) => {
								let orderId = order.id
								//move cart items to orderIttem table
								Order.CartItem.findAll({
									where: { userId },
									order: [['createdat', 'DESC']],
									//raw: true
								})
									.then((cartItem) => {
										console.log("cartItem");
										cartItem.forEach(element => {
											let userId = element.userId;
											let amount = element.amount;
											let price = element.totalprice;
											let product = element.product;

											Order.OrderItem.create(
												{ userId, amount, price, product, orderId }
											)
												.then(() => {
													Order.CartItem.destroy({ where: { userId: req.user.id } });
												})
										});
										res.redirect('/payment/payment/' + orderId);
									})
							})
					})
			}
			else {
				// create a new order
				console.log("no voucher used");
				let userId = req.user.id;
				let totalamount = req.body.totalamount;
				let status = "Unshipped";
				let payment = "Unpaid";
				let address = req.body.address;
				let Vanaddress = "30 Jalan Kilang Barat Singapore 159363";
				console.log("address: " + address);
				Order.Order.create({ totalamount, userId, status, payment, address, Vanaddress })
					.then(() => {
						Order.Order.findOne({
							where: { userId },
							order: [['createdAt', 'DESC']],
							raw: true
						})
							.then((order) => {
								let orderId = order.id
								//move cart items to orderIttem table
								Order.CartItem.findAll({
									where: { userId },
									order: [['createdat', 'DESC']],
									//raw: true
								})
									.then((cartItem) => {
										console.log("cartItem");
										cartItem.forEach(element => {
											let userId = element.userId;
											let amount = element.amount;
											let price = element.totalprice;
											let product = element.product;

											Order.OrderItem.create(
												{ userId, amount, price, product, orderId }
											)
												.then(() => {
													Order.CartItem.destroy({ where: { userId: req.user.id } });
												})
										});
										res.redirect('/payment/payment/' + orderId);
									})
							})
					})
			}
		}
	}
});

router.get('/cartForVoucher/:id', async (req, res) => {
	uservoucher = await Voucher.UserVoucher.findOne({ where: { code: req.params.id, use: 0 } });
	let pricecount = 0;
	let shippingcount = 0;
	Order.CartItem.findAll({
		where: { userId: req.user.id },
		order: [['createdat', 'DESC']],
		// raw: true
	})
		.then((cartItem) => {

			cartItem.forEach(element => {
				let price = element.totalprice;
				let shipping = element.weight;
				console.log("voucher applied");
				pricecount = parseFloat(pricecount) + parseFloat(price) * 1.07;
				shippingcount = parseFloat(shippingcount) + parseFloat(shipping);
				console.log("pricecount " + pricecount);

			});
			let totaltotal = parseFloat(pricecount) + 12
			res.render('../views/cart/cartvoucher.handlebars', { cartItem, uservoucher, pricecount, totaltotal });
		})
		.catch(err => console.log(err));
});

router.post('/cartForVoucher/:id', (req, res) => {

	console.log(req.body.final)

	if (req.body.checkout == 'checkout') {
		if (req.body.sum == 0 && req.body.sum2 == 0) {
			flashMessage(res, 'error', 'There is no product in the cart');
			res.redirect('/cart/cart');
		}
		else {
			if (req.body.final != null) {
				console.log("final price:" + req.body.final);
				let userId = req.user.id;
				let totalamount = req.body.final; //final price with voucher
				let status = "Unshipped";
				let payment = "Unpaid";
				let address = req.body.address;
				let Vanaddress = "30 Jalan Kilang Barat Singapore 159363";
				console.log("address: " + address);
				Order.Order.create({ totalamount: totalamount, userId, status, payment, address, Vanaddress })
					.then(() => {
						Order.Order.findOne({
							where: { userId },
							order: [['createdAt', 'DESC']],
							raw: true
						})
							.then((order) => {
								let orderId = order.id
								//move cart items to orderIttem table
								Order.CartItem.findAll({
									where: { userId },
									order: [['createdat', 'DESC']],
									//raw: true
								})
									.then((cartItem) => {
										console.log("cartItem");
										cartItem.forEach(element => {
											let userId = element.userId;
											let amount = element.amount;
											let price = element.totalprice;
											let product = element.product;

											Order.OrderItem.create(
												{ userId, amount, price, product, orderId }
											)
												.then(() => {
													Order.CartItem.destroy({ where: { userId: req.user.id } });
												})
										});
										res.redirect('/payment/payment/' + orderId);
									})
							})
					})
			}
			else {
				// create a new order
				console.log("no voucher used");
				let userId = req.user.id;
				let totalamount = req.body.totalamount;
				let status = "Unshipped";
				let payment = "Unpaid";
				let address = req.body.address;
				let Vanaddress = "30 Jalan Kilang Barat Singapore 159363";
				console.log("address: " + address);
				Order.Order.create({ totalamount, userId, status, payment, address, Vanaddress })
					.then(() => {
						Order.Order.findOne({
							where: { userId },
							order: [['createdAt', 'DESC']],
							raw: true
						})
							.then((order) => {
								let orderId = order.id
								//move cart items to orderIttem table
								Order.CartItem.findAll({
									where: { userId },
									order: [['createdat', 'DESC']],
									//raw: true
								})
									.then((cartItem) => {
										console.log("cartItem");
										cartItem.forEach(element => {
											let userId = element.userId;
											let amount = element.amount;
											let price = element.totalprice;
											let product = element.product;

											Order.OrderItem.create(
												{ userId, amount, price, product, orderId }
											)
												.then(() => {
													Order.CartItem.destroy({ where: { userId: req.user.id } });
												})
										});
										res.redirect('/payment/payment/' + orderId);
									})
							})
					})
			}
		}
	}	
})










module.exports = router;