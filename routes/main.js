const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const catalogue_router = require('./manage_catalogue');
const Booking = require('../models/Booking');

// newsletter email verification:
const sgMail = require('@sendgrid/mail');
const sgClient = require('@sendgrid/client');
require('dotenv').config();
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
	res.render('landing')
});

router.get('/catalogue', (req, res) => {
	res.render('./product/catalogue');
});


router.get('/quiz', (req, res) => {
	res.render('./quiz/createQuiz');
});

router.get('/booking', (req, res) => {
	res.render('./booking/addBooking');
});

// Newsletter Subscription
router.get('/', (req, res) => {
	res.render('newsletter/addSubscriber');
});

router.post('/', async (req, res) => {
	const confNum = randNum();
	console.log("confNum",confNum);
	const params = new URLSearchParams({
		conf_num: confNum,
		email: req.body.email,
	});
	const confirmationURL = req.protocol + '://' + req.headers.host + '/confirm/?' + params;
	const fname = req.body.firstName;
	const msg = {
		to: req.body.email,
		from: 'thehealinginctester@gmail.com', // Change to your verified sender
		subject: `Confirm your subscription to our newsletter`,
		html: `
		<body style="background-color: #f1ede5; color: black">
		<br><br>
		<!-- start preheader -->
		<div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
			Confirm your subscription to our newsletter
		</div>
		<!-- end preheader -->

		<!-- start body -->
		<table border="0" cellpadding="0" cellspacing="0" width="100%">
			<!-- start hero -->
			<tr>
			<td align="center" bgcolor="#f1ede5">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
				<tr>
					<td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
					<h1 style="text-align: centre; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px; align="center>Just One Step Away!</h1>
					</td>
				</tr>
				</table>
			</td>
			</tr>
			<!-- end hero -->

			<!-- start copy block -->
			<tr>
			<td align="center" bgcolor="#f1ede5">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

				<!-- start copy -->
				<tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<p style="margin: 0;">Dear ${fname}, <br><br>Thank you for subscribing to our newsletter. Tap the button below to confirm your email address for our newsletter subscription service. 
					If you didn't request for this, you can safely delete this email.</p>
					</td>
				</tr>
				<!-- end copy -->

				<!-- start button -->
				<tr>
					<td align="left" bgcolor="#ffffff">
					<table border="0" cellpadding="0" cellspacing="0" width="100%">
						<tr>
						<td align="center" bgcolor="#ffffff" style="padding: 12px;">
							<table border="0" cellpadding="0" cellspacing="0">
							<tr>
								<td align="center" bgcolor="#8BAD97" style="border-radius: 6px;">
								<a href="${confirmationURL}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Confirm Email</a>
								</td>
							</tr>
							</table>
						</td>
						</tr>
					</table>
					</td>
				</tr>
				<!-- end button -->

				<!-- start copy -->
				<tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
					<p style="margin: 0;"><a href="${confirmationURL}" target="_blank">link</a></p>
					</td>
				</tr>
				<!-- end copy -->

				<!-- start copy -->
				<tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
					<p style="margin: 0;">Cheers,<br> The Healing Inc.</p>
					</td>
				</tr>
				<!-- end copy -->

				</table>
			</td>
			</tr>
			<!-- end copy block -->

			<!-- start footer -->
			<tr>
			<td align="center" bgcolor="#f1ede5" style="padding: 24px;">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

				<!-- start permission -->
				<tr>
					<td align="center" bgcolor="#f1ede5" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
					<p style="margin: 0;">You received this email because we received a request for newsletter subscription for your account. If you didn't request for newsletter subscription you can safely delete this email.</p>
					</td>
				</tr>
				<!-- end permission -->
				</table>
			</td>
			</tr>
			<!-- end footer -->

		</table>
		`
	}
	await addContact(req.body.firstName, req.body.lastName, req.body.email, confNum);
	await sgMail.send(msg);
	res.render('newsletter/message', { message: 'Thank you for signing up for our newsletter! Please complete the process by confirming the subscription in your email inbox.', card_title: "Just One Step Away!", button: "Return", link: "/" });
});

router.get('/confirm', async (req, res) => {
	try {
		const contact = await getContactByEmail(req.query.email);
		if (contact == null) throw `Contact not found.`;
		console.log("custom_fields", contact.custom_fields.conf_num)
		console.log("query", req.query.conf_num)
		if (contact.custom_fields.conf_num == req.query.conf_num) {
			const listID = await getListID('Newsletter Subscribers');
			await addContactToList(req.query.email, listID);
		} else {
			throw 'Confirmation number does not match';
		}
		res.render('newsletter/message', { message: 'You are now subscribed to our newsletter. We can\'t wait for you to hear from us!', card_title: "Confirmation Successful", button: "Home", link: "/" });
	} catch (error) {
		console.error(error);
		res.render('newsletter/message', { message: 'Subscription was unsuccessful. Please try again.', card_title: "Confirmation Unsuccessful", button: "Try Again", link: "/" });
	}
});

router.get('/upload', (req, res) => {
	res.render('newsletter/addNewsletter', { layout: 'staffMain' });
});

router.post('/upload', async (req, res) => {
	const listID = await getListID('Newsletter Subscribers');
	const htmlNewsletter = req.files.newsletter.data.toString();
	await sendNewsletterToList(req, htmlNewsletter, listID)
	res.render('newsletter/message', { message: 'Newsletter has been sent to all subscribers.' });
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

module.exports = router;
