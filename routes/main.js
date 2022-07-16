const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Order = require('../models/Order');
const catalogue_router = require('./manage_catalogue');
const Booking = require('../models/Booking');
const sgMail = require('@sendgrid/mail');
const sgClient = require('@sendgrid/client');

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

// router.post('/', (req, res) => {
// 	const fname = req.body.fname;
// 	const lname = req.body.lname;
// 	const email = req.body.email;
// 	const list_id = '2f9a5c7972';

// 	var data = {
// 		members: [{
// 			email_address: email,
// 			status: 'subscribed',
// 			merge_fields: {
// 				FNAME: fname,
// 				LNAME: lname
// 			}
// 		}]
// 	}

// 	var jsonData = JSON.stringify(data);

// 	const api = '2a2ac40f8d8901552d1b94f528449a74-us13';

// 	const request = require('request')

// 	const options = {

// 		url: `https://us13.api.mailchimp.com/3.0/lists/${list_id}`,
// 		method: 'POST',
// 		headers: {
// 			'Authorization': `romeo1 ${api}`
// 		},
// 		body: jsonData
// 	};

// 	request(options, function (error, response, body) {
// 		if (error) {
// 			console.log("error");
// 		} else {
// 			if (response.statusCode === 200) {
// 				console.log("Sent")
// 				res.render('landing')
// 			} else {
// 				console.log("cant go in");
// 			}
// 		}
// 	})

// });

router.get('/', (req, res) => {
	res.render('newsletter/form', signUpPage);
});

router.post('/', async (req, res) => {
	const confNum = randNum();
	console.log(confNum);
	const params = new URLSearchParams({
		conf_num: confNum,
		email: req.body.email,
	});
	const confirmationURL = req.protocol + '://' + req.headers.host + '/confirm/?' + params;
	const msg = {
		to: req.body.email,
		from: 'thehealinginctester@gmail.com', // Change to your verified sender
		subject: `Confirm your subscription to our newsletter`,
		html: `Hello ${req.body.firstname},<br>Thank you for subscribing to our newsletter. Please complete and confirm your subscription by <a href="${confirmationURL}"> clicking here</a>.`
	}
	await addContact(req.body.firstname, req.body.lastname, req.body.email, confNum);
	await sgMail.send(msg);
	res.render('newsletter/message', { message: 'Thank you for signing up for our newsletter! Please complete the process by confirming the subscription in your email inbox.' });
});

router.get('/confirm', async (req, res) => {
	try {
		const contact = await getContactByEmail(req.query.email);
		if (contact == null) throw `Contact not found.`;
		console.log("custom_fields", contact.custom_fields.conf_num)
		if (contact.custom_fields.conf_num == req.query.conf_num) {
			const listID = await getListID('Newsletter Subscribers');
			await addContactToList(req.query.email, listID);
		} else {
			throw 'Confirmation number does not match';
		}
		res.render('message', { message: 'You are now subscribed to our newsletter. We can\'t wait for you to hear from us!' });
	} catch (error) {
		console.error(error);
		res.render('message', { message: 'Subscription was unsuccessful. Please <a href="/signup">try again.</a>' });
	}
});

router.get('/upload', (req, res) => {
	res.render('form', uploadPage);
});

router.post('/upload', async (req, res) => {
	const listID = await getListID('Newsletter Subscribers');
	const htmlNewsletter = req.files.newsletter.data.toString();
	await sendNewsletterToList(req, htmlNewsletter, listID)
	res.render('message', { message: 'Newsletter has been sent to all subscribers.' });
});

router.get('/delete', async (req, res) => {
	try {
		const contact = await getContactByEmail(req.query.email);
		if (contact == null) throw `Contact not found.`;
		if (contact.custom_fields.conf_num == req.query.conf_num) {
			const listID = await getListID('Newsletter Subscribers');
			await deleteContactFromList(listID, contact);
			res.render('message', { message: 'You have been successfully unsubscribed. If this was a mistake re-subscribe <a href="/signup">here</a>.' });
		}
		else throw 'Confirmation number does not match or contact is not subscribed'
	}
	catch (error) {
		console.error(error)
		res.render('message', { message: 'Email could not be unsubscribed. please try again.' })
	}
});

// Helper functions and variables
function randNum() {
	return Math.floor(Math.random() * 90000) + 10000;
}

async function addContact(firstName, lastName, email, confNum) {
	const customFieldID = await getCustomFieldID('conf_num');
	const data = {
		"contacts": [{
			"email": email,
			"first_name": firstName,
			"last_name": lastName,
			"custom_fields": {}
		}]
	};
	data.contacts[0].custom_fields[customFieldID] = confNum;
	const request = {
		url: `/v3/marketing/contacts`,
		method: 'PUT',
		body: data
	}
	return sgClient.request(request);
}

async function getCustomFieldID(customFieldName) {
	const request = {
		url: `/v3/marketing/field_definitions`,
		method: 'GET',
	}
	const response = await sgClient.request(request);
	const allCustomFields = response[1].custom_fields;
	return allCustomFields.find(x => x.name === customFieldName).id;
}

async function getContactByEmail(email) {
	const data = {
		"emails": [email]
	};
	const request = {
		url: `/v3/marketing/contacts/search/emails`,
		method: 'POST',
		body: data
	}
	const response = await sgClient.request(request);
	if (response[1].result[email]) return response[1].result[email].contact;
	else return null;
}

async function getListID(listName) {
	const request = {
		url: `/v3/marketing/lists`,
		method: 'GET',
	}
	const response = await sgClient.request(request);
	const allLists = response[1].result;
	return allLists.find(x => x.name === listName).id;
}

async function addContactToList(email, listID) {
	const data = {
		"list_ids": [listID],
		"contacts": [{
			"email": email
		}]
	};
	const request = {
		url: `/v3/marketing/contacts`,
		method: 'PUT',
		body: data
	}
	return sgClient.request(request);
}

async function sendNewsletterToList(req, htmlNewsletter, listID) {
	const data = {
		"query": `CONTAINS(list_ids, '${listID}')`
	};
	const request = {
		url: `/v3/marketing/contacts/search`,
		method: 'POST',
		body: data
	}
	const response = await sgClient.request(request);
	for (const subscriber of response[1].result) {
		const params = new URLSearchParams({
			conf_num: subscriber.custom_fields.conf_num,
			email: subscriber.email,
		});
		const unsubscribeURL = req.protocol + '://' + req.headers.host + '/delete/?' + params;
		const msg = {
			to: subscriber.email, // Change to your recipient
			from: "thehealinginctester@gmail.com", // Change to your verified sender
			subject: req.body.subject,
			html: htmlNewsletter + `<a href="${unsubscribeURL}"> Unsubscribe here</a>`,
		}
		sgMail.send(msg);
	}
}

async function deleteContactFromList(listID, contact) {
	const request = {
		url: `/v3/marketing/lists/${listID}/contacts`,
		method: 'DELETE',
		qs: {
			"contact_ids": contact.id
		}
	}
	await sgClient.request(request);
}

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
