const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/User');
const ensureAuthenticated = require('../helpers/auth');
const { response } = require('express');
const Voucher = require('../models/Voucher');


router.get('/cart', ensureAuthenticated, (req, res) => {
	Order.CartItem.findAll({
		where: { userId: req.user.id },
		order: [['createdat', 'DESC']],
		// raw: true
	})
		.then((cartItem) => {
			// console.log(cartItem);
			// pass object to cart.handlebars
			res.render('../views/cart/cart.handlebars', { cartItem });
		})
		.catch(err => console.log(err));
});


router.post('/cart', ensureAuthenticated, async (req, res) => {
	let item_id = await Order.CartItem.findByPk(req.body.item_id);

	User.findByPk(req.user.id)///////////////////////////////////////////////add voucher to uservoucherdb
		.then((user) => {
			Voucher.Voucher.findAll({
				where: { invalidtype: "valid" }
			})
				.then((voucher) => {
					// console.log(voucher)
					voucher.forEach(element => {
						// console.log(req.user.id)
						let userId = req.user.id;
						let voucherId = element.id
						let vname = element.vname
						let dtype = element.dtype
						let discount = element.discount
						let minspend = element.minspend
						let code = element.code
						let valid = element.valid
						let displaydate = element.displaydate
						let invalidtype = element.invalidtype

						Voucher.UserVoucher.findOrCreate({
							where: { userId: userId, voucherId: voucherId },
							defaults: {
								//   job: 'Technical Lead JavaScript'
								vname,
								dtype,
								discount,
								minspend,
								code,
								valid,
								displaydate,
								invalidtype,
								use: 0,
								userId,
								voucherId
							}
						});

					})

				})
				.catch(err => console.log(err));
		})
		.catch(err => console.log(err));
	//////////////////////////////////////////////////////////////////^add voucher to uservoucher db

	if (req.body.minus == "minus") {
		const amount = parseInt(req.body.amount)
		if (amount <= 1) {
			flashMessage(res, 'success', 'Product has deleted for you');
			await Order.CartItem.destroy({ where: { id: item_id.id } });
			res.redirect('/cart/cart');
		}
		else {
			const new_amount = amount - 1;
			const price = parseFloat(req.body.totalprice) - parseFloat(req.body.price);
			await item_id.update({
				product: req.body.product,
				amount: new_amount,
				totalprice: price
			})
			res.redirect('/cart/cart');
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
		res.redirect('/cart/cart');
	}
	else if (req.body.deleteitem == "deleteitem") {
		flashMessage(res, 'success', 'Product successfully deleted');
		await Order.CartItem.destroy({ where: { id: item_id.id } });
		res.redirect('/cart/cart');
	}

	else if (req.body.apply == 'apply') {        ///////////////////////////////////////apply voucher
		console.log("apply")
		if (req.body.sum == 0) {
			flashMessage(res, 'error', 'There is no product in the cart');
			res.redirect('/cart/cart');
		}

		if (req.body.code.length == 0) {
			console.log("no code")
			flashMessage(res, 'error', 'No code entered');
			res.redirect('/cart/cart');
		}
		
		else {
			let totalamountforvoucher = req.body.totalamountforvoucher;

			uservoucher = await Voucher.UserVoucher.findOne({ where: {  code: req.body.code, use: 0 } });
			if (!uservoucher){
				console.log("invalid")
				flashMessage(res, 'error', 'Invalid Voucher');
			    res.redirect('/cart/cart');
			}
			
			if (uservoucher){
                console.log("totalamt:" +totalamountforvoucher)
				console.log("minspend:" +uservoucher.minspend)
				console.log(parseFloat(totalamountforvoucher)+" "+parseFloat(uservoucher.minspend))

				if(parseFloat(totalamountforvoucher)<parseFloat(uservoucher.minspend)){
					console.log(parseFloat(totalamountforvoucher)+" "+parseFloat(uservoucher.minspend))
					flashMessage(res, 'error', 'Minimum spend of'+' $'+parseFloat(uservoucher.minspend)+" to use the voucher: '"+uservoucher.code+"'");
			        res.redirect('/cart/cart');
				}

				else{
                    

					Order.CartItem.findAll({
						where: { userId: req.user.id },
						order: [['createdat', 'DESC']],
						// raw: true
					})
						.then((cartItem) => {
							// console.log(cartItem);
							// pass object to cart.handlebars
							console.log("voucher applied")
					        res.render('../views/cart/cartvoucher.handlebars', { cartItem, uservoucher });
						})
						.catch(err => console.log(err));
				}

                
			}
			
			
			// if (!item_id) {
			// 	flashMessage(res, 'error', 'There is no product in the cart');
			// 	res.redirect('/cart/cart');
			// }
        

		}
	}                                                  ////////////////////////////////apply voucher

	else if (req.body.checkout == 'checkout') {
		if (req.body.sum == 0) {
			flashMessage(res, 'error', 'There is no product in the cart');
			res.redirect('/cart/cart');
		}
		else {

			// create a new order
			let userId = req.user.id;
			let totalamount = req.body.totalamount;
			let status = "Unshipped";
			let payment = "Unpaid";
			let address = req.body.address;
			let Vanaddress = "30 Jalan Kilang Barat Singapore 159363";
			let code = req.body.code;
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


				}




				)
		}
	}
});










module.exports = router;