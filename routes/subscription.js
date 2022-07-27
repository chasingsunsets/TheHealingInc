const express = require('express');
const router = express.Router();

// models
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// helpers
const flashMessage = require('../helpers/messenger');

// api
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

// c: subscribe
router.get('/addSub', (req, res) => {
    res.render('newsletter/add');
});

router.post('/addSub', async function (req, res) {

    let { firstName, lastName, email } = req.body;
    let isValid = true;

    if (!isValid) {
        res.render('newsletter/add', {
            firstName, lastName, email
        });
        return;
    }

    try {
        // If all is well, checks if subscription email is already registered
        let subscription = await Subscription.findOne({ where: { email: email } });

        if (subscription) {
            // If subscription email is found, that means email has already been registered
            // flashMessage(res, 'error', email + ' already registered');
            // res.render('newsletter/add', {
            //     firstName, lastName, email
            // });
            // flashMessage(res, 'error', email + ' already registered');
            res.render('subscription/message', { message: 'Email have been used. Please try again using a different email.', card_title: "Subscription Unsucessful", button: "Try Again", link: "/" });
        }

        else {
            // Create new subscription record
            let subscription = await Subscription.create({ firstName, lastName, email, verified: 0 });

            User.findAll({
                raw: true
            })
                .then((users) => {
                    // create a userList that takes in user email
                    let userList = [];
                    for (let i = 0; i < users.length; i++) {
                        userList.push(users[i].email);
                    }

                    // compare if subscription email is already a user email ==> if yes: dont need to send verify message
                    if (userList.includes(subscription.email) == true) {
                        Subscription.update(
                            { verified: 1 },
                            { where: { id: subscription.id } });
                        // console.log("Dont need send email");
                        res.render('subscription/message', { message: 'You have sucessfully subscribed to The Healing Inc. newsletter.', card_title: "Subscription Successful", button: "Start Shopping", link: "/" });
                    }

                    else {
                        // Send email
                        let token = jwt.sign(email, process.env.APP_SECRET);
                        let url = `${process.env.BASE_URL}:${process.env.PORT}/subscription/verify/${subscription.id}/${token}`;
                        let urlDelete = `${process.env.BASE_URL}:${process.env.PORT}/subscription/deleteSub/${subscription.id}`;
                        sendEmail(subscription.email, url, urlDelete, firstName)
                            .then(response => {
                                console.log(response);
                                // flashMessage(res, 'success', subscription.email + ' signed up successfully');
                                // res.redirect('/');
                                res.render('subscription/message', { message: 'You have subscribed successfully to The Healing Inc. newsletter. Please verify via your email.', card_title: "Subscription Successful", button: "Start Shopping", link: "/" });
                            })
                            .catch(err => {
                                console.log(err);
                                res.render('subscription/message', { message: 'Error when sending email to ' + subscription.email, card_title: "Subscription Unsucessful", button: "Try Again", link: "/" });
                                // flashMessage(res, 'error', 'Error when sending email to ' + subscription.email);
                                // res.redirect('/');
                            });
                    }
                })
                .catch(err => console.log(err));



        }
    }
    catch (err) {
        console.log(err);
    }

});

// r: list of subscriptions
router.get('/listSubscriptions', (req, res) => {
    Subscription.findAll({
        raw: true
    })
        .then((subscriptions) => {
            res.render('subscription/listSubscriptions', {
                subscriptions, layout: 'staffMain', firstName: subscriptions.firstName,
                lastName: subscriptions.lastName, email: subscriptions.email, verified: subscriptions.verified
            });
        })
        .catch(err => console.log(err));
});

// d: unsubscribe
router.get('/deleteSub/:id', async function (req, res) {
    try {
        let subscription = await Subscription.findByPk(req.params.id);
        console.log(req.params.id)
        if (!subscription) {
            res.render('subscription/message', { message: 'Subscription ID not found. Please try again', card_title: "Unsubscribe Unsuccessful", button: "Try Again", link: "/" });
            // flashMessage(res, 'error', 'Subscription not found');
            // res.redirect('/');
            return;
        }

        // this is to check if the staff in logged in:
        // if (req.subscription.id != req.params.id) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/');
        //     return;
        // }

        let result = await Subscription.destroy({ where: { id: subscription.id } });
        console.log(result + ' subscription deleted');
        res.render('subscription/message', { message: 'You have unsubscribed successfully to The Healing Inc. newsletter.', card_title: "Unsubscribe Successful", button: "Home", link: "/" });
        // flashMessage(res, 'success', 'Subscription successfully deleted');
        // res.redirect('/');
    }
    catch (err) {
        console.log(err);
    }
});

// send email function
function sendEmail(toEmail, url, urlDelete, firstName) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `The Healing Inc. <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Email Confirmation Newsletter SignUp',
    //     html: `Thank you for registering fo.<br><br> Please
    // <a href=\"${url}"><strong>verify</strong></a> your account.`
        html:
            `
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
					<p style="margin: 0;">Dear ${firstName}, <br><br>Thank you for subscribing to our newsletter. Tap the button below to confirm your email address for our newsletter subscription service. 
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
								<a href="${url}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Confirm Email</a>
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
					<p style="margin: 0;"><a href="${url}" target="_blank">link</a></p>
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
                <tr>
					<td align="center" bgcolor="#f1ede5" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
					<p style="margin: 0;"><a href="${urlDelete}" target="_blank">Unsubscribe Here</a></p>
					</td>
				</tr>
				<!-- end permission -->
				</table>
			</td>
			</tr>
			<!-- end footer -->

		</table>
		`
    };

    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

// verify function
router.get('/verify/:subscriptionId/:token', async function (req, res) {
    let id = req.params.subscriptionId;
    let token = req.params.token;
    try {
        // Check if subscription is found
        let subscription = await Subscription.findByPk(id);
        if (!subscription) {
            // flashMessage(res, 'error', 'Subscription not found');
            // res.redirect('/');
            res.render('subscription/message', { message: 'No subscription found. Please try again.', card_title: "Verfication Unsucessful", button: "Home", link: "/" });
            return;
        }
        // Check if subscription has been verified
        if (subscription.verified) {
            res.render('subscription/message', { message: 'Your email have been verified. Look out for exciting newsletters coming your way!', card_title: "Verfication Sucessful", button: "Start Shopping", link: "/" });
            return;
        }
        // Verify JWT token sent via URL
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData != subscription.email) {
            // flashMessage(res, 'error', 'Unauthorised Access');
            // res.redirect('/');
            res.render('subscription/message', { message: 'There is an error. Please try again.', card_title: "Verfication Unsucessful", button: "Home", link: "/" });
            return;
        }
        let result = await Subscription.update(
            { verified: 1 },
            { where: { id: subscription.id } });
        console.log(result[0] + ' subscription updated');
        // flashMessage(res, 'success', subscription.email + ' verified. Please login');
        // res.redirect('/');
        res.render('subscription/message', { message: 'Your email have been verified. Look out for exciting newsletters coming your way!', card_title: "Verfication Sucessful", button: "Start Shopping", link: "/" });
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;