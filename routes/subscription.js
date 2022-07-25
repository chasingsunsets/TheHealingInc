const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const flashMessage = require('../helpers/messenger');
const Newsletter = require('../models/Newsletter');
const upload = require('../helpers/imageUpload');

// Required for verification
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

// // Add Newsletter
// router.get('/retrieveNewsletter', (req, res) => {
//     res.render('newsletter/retrieveNewsletter', { layout: 'staffMain' });
// });

router.get('/retrieveNewsletter', (req, res) => {
    Newsletter.findAll({
        raw: true
    })
        .then((newsletters) => {
            res.render('newsletter/retrieveNewsletter', {
                newsletters, layout: 'staffMain', newsletterName: newsletters.newsletterName, 
                purpose: newsletters.purpose, createdBy: newsletters.createdBy, status: newsletters.status, fileUpload: newsletters.fileUpload});
        })
        .catch(err => console.log(err));
});

router.get('/addNewsletter', (req, res) => {
    res.render('newsletter/addNewsletter', { layout: 'staffMain' });
});

router.post('/addNewsletter', (req, res) => {
    let newsletterName = req.body.newsletterName;
    let purpose = req.body.purpose;
    let createdBy = req.body.createdBy;
    let status = req.body.status;
    let fileUpload = req.body.fileUpload;
    Newsletter.create(
        {
            newsletterName, purpose, createdBy, status, fileUpload
        }
    )
        .then((newsletter) => {
            console.log(newsletter.toJSON());
            res.redirect('/subscription/retrieveNewsletter');
        })
        .catch(err => console.log(err))
});

router.post('/upload', (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, {
            recursive:
                true
        });
    }
    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({
                file: `/uploads/${req.user.id}/${req.file.filename}`
            });
        }
    });
});

// Newsletter Subscription
router.get('/addSub', (req, res) => {
    res.render('newsletter/add');
});

function sendEmail(toEmail, url, firstName) {
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

router.get('/verify/:subscriptionId/:token', async function (req, res) {
    let id = req.params.subscriptionId;
    let token = req.params.token;
    try {
        // Check if subscription is found
        let subscription = await Subscription.findByPk(id);
        if (!subscription) {
            flashMessage(res, 'error', 'Subscription not found');
            res.redirect('/');
            return;
        }
        // Check if subscription has been verified
        if (subscription.verified) {
            flashMessage(res, 'info', 'Subscription already verified');
            res.redirect('/');
            return;
        }
        // Verify JWT token sent via URL
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData != subscription.email) {
            flashMessage(res, 'error', 'Unauthorised Access');
            res.redirect('/');
            return;
        }
        let result = await Subscription.update(
            { verified: 1 },
            { where: { id: subscription.id } });
        console.log(result[0] + ' subscription updated');
        flashMessage(res, 'success', subscription.email + ' verified. Please login');
        res.redirect('/');
    }
    catch (err) {
        console.log(err);
    }
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
            res.render('newsletter/message', { message: 'Subscription was unsuccessful. Please try again using a different email.', card_title: "Subscription Unsucessful", button: "Try Again", link: "/" });
        }

        else {
            // Create new subscription record
            let subscription = await Subscription.create({ firstName, lastName, email, verified: 0 });

            // Send email
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/subscription/verify/${subscription.id}/${token}`;
            sendEmail(subscription.email, url, firstName)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', subscription.email + ' signed up successfully');
                    res.redirect('/');
                })
                .catch(err => {
                    console.log(err);
                    res.render('newsletter/message', { message: 'Subscription was unsuccessful. Please try again.', card_title: "Confirmation Unsuccessful", button: "Try Again", link: "/" });
                    flashMessage(res, 'error', 'Error when sending email to ' + subscription.email);
                    res.redirect('/');
                });



        }
    }
    catch (err) {
        console.log(err);
    }

});

router.get('/deleteSub/:id', async function (req, res) {
    try {
        let subscription = await Subscription.findByPk(req.params.id);
        if (!subscription) {
            flashMessage(res, 'error', 'Subscription not found');
            res.redirect('/');
            return;
        }

        if (req.subscription.id != req.params.id) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/');
            return;
        }

        let result = await Subscription.destroy({ where: { id: subscription.id } });
        console.log(result + ' subscription deleted');
        flashMessage(res, 'success', 'Subscription successfully deleted');
        res.redirect('/');
    }
    catch (err) {
        console.log(err);
    }
});

// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         // Success redirect URL
//         successRedirect: '/user/profile',
//         // Failure redirect URL
//         failureRedirect: '/user/login',
//         /* Setting the failureFlash option to true instructs Passport to flash
//         an error message using the message given by the strategy's verify callback.
//         When a failure occur passport passes the message object as error */
//         failureFlash: true
//     })(req, res, next);
// });

// router.get('/logout', (req, res) => {
//         req.logout();
//         res.redirect('/');
//         });  here broken, fix found online was:
// router.get('/logout', (req, res) => {
//     req.logout(function (err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//     });
// });

// router.get('/profile', ensureAuthenticated, (req, res) => {

//     res.render('user/profile', { layout: 'account', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, phoneno: req.user.phoneno, address: req.user.address, email: req.user.email, id: req.user.id });
// });

// router.get('/editprofile/:id', ensureAuthenticated, (req, res) => {
//     User.findByPk(req.params.id)
//         .then((user) => {

//             if (!user) {
//                 flashMessage(res, 'error', 'Invalid access');
//                 res.redirect('/user/profile');
//                 return;
//             }

//             if (req.user.id != req.params.id) {
//                 flashMessage(res, 'error', 'Unauthorised access');
//                 res.redirect('/user/profile');
//                 return;
//             }

//             res.render('user/editprofile', { user });
//         })
//         .catch(err => console.log(err));
// });

// router.post('/editprofile/:id', ensureAuthenticated, (req, res) => {
//     let firstname = req.body.firstname;
//     let lastname = req.body.lastname;
//     let username = req.body.username;
//     let phoneno = req.body.phoneno;
//     let address = req.body.address;
//     let email = req.body.email;
//     let password = req.body.password;
//     let password2 = req.body.password2

//     let isValid = true;
//     if (password.length < 6) {
//         flashMessage(res, 'error', 'Password must be at least 6 characters');
//         isValid = false;
//     }
//     if (password != password2) {
//         flashMessage(res, 'error', 'Passwords do not match');
//         isValid = false;
//     }
//     if (phoneno.length != 8) {
//         flashMessage(res, 'error', 'Phone number must be 8 digits');
//         isValid = false;
//     }

//     if (!isValid) {
//         User.findByPk(req.params.id)
//             .then((user) => {
//                 res.render('user/editprofile', { user });
//             })
//             .catch(err => console.log(err));
//         return;
//     }

//     var salt = bcrypt.genSaltSync(10);
//     var hash = bcrypt.hashSync(password, salt);

//     User.update(
//         { firstname, lastname, username, phoneno, address, email, password: hash },
//         { where: { id: req.params.id } }
//     )
//         .then((result) => {
//             console.log(result[0] + ' profile updated');
//             res.redirect('/user/profile');
//         })
//         .catch(err => console.log(err));
// });

// router.get('/deleteaccount/:id', ensureAuthenticated, async function (req, res) {
//     try {
//         let user = await User.findByPk(req.params.id);
//         if (!user) {
//             flashMessage(res, 'error', 'User not found');
//             res.redirect('/user/profile');
//             return;
//         }

//         if (req.user.id != req.params.id) {
//             flashMessage(res, 'error', 'Unauthorised access');
//             res.redirect('/user/profile');
//             return;
//         }


//         let result = await User.destroy({ where: { id: user.id } });
//         console.log(result + ' account deleted');
//         flashMessage(res, 'success', 'Account successfully deleted');
//         res.redirect('/user/login');
//     }
//     catch (err) {
//         console.log(err);
//     }
// });

module.exports = router;