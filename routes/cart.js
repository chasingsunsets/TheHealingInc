const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');


router.get('/cart', (req, res) => {
	res.render('../views/cart/cart.handlebars');
});

router.post('/cart', async (req, res) => {
	// validation code...

	
})









module.exports = router;