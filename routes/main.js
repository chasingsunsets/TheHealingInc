const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const catalogue_router = require('./manage_catalogue');
const Booking = require('../models/Booking');

router.get('/', (req, res) => {
	res.render('landing')
});

router.use("/catalogue",catalogue_router);

router.get('/quiz', (req, res) => {
	res.render('./quiz/createQuiz');
});

router.get('/booking', (req, res) => {
	res.render('./booking/addBooking');
});

router.get('/addNewsletter', (req, res) => {
	res.render('newsletter/add')
});

router.post('/addNewsletter', (req, res) => {
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const email = req.body.email;
	const list_id = '2f9a5c7972';

	var data = {
		members: [{
			email_address: email,
			status: 'subscribed',
			merge_fields: {
				FNAME: firstName,
				LNAME: lastName
			}
		}]
	}

	var jsonData = JSON.stringify(data);

	const api = '2a2ac40f8d8901552d1b94f528449a74-us13';

	const request = require('request')

	const options = {

		url: `https://us13.api.mailchimp.com/3.0/lists/${list_id}`,
		method: 'POST',
		headers: {
			'Authorization': `romeo1 ${api}`
		},
		body: jsonData
	};

	request(options, function (error, response, body) {
		if (error) {
			console.log("error");
		} else {
			if (response.statusCode === 200) {
				console.log("Sent")
				res.render('landing')
			} else {
				console.log("cant go in");
			}
		}
	})

});

// router.post('/flash', (req, res) => {
// 	const message = 'This is an important message';
// 	const error = 'This is an error message';
// 	const error2 = 'This is the second error message';
// 	// req.flash('message', message);
// 	// req.flash('error', error);
// 	// req.flash('error', error2);
// 	flashMessage(res, 'success', message);
// 	flashMessage(res, 'info', message);
// 	flashMessage(res, 'error', error);
// 	flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);
// 	res.redirect('/');
// });


module.exports = router;
