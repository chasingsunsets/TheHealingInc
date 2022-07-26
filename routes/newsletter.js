const express = require('express');
const router = express.Router();

// models
const Subscription = require('../models/Subscription');
const Newsletter = require('../models/Newsletter');

// helpers
const upload = require('../helpers/imageUpload');
const flashMessage = require('../helpers/messenger');

// api
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// testing summernote:
router.get('/summernote', (req, res) => {
    res.render('newsletter/summernote', { layout: 'staffMain' });
});

// c: create newsletter
router.get('/addNewsletter', (req, res) => {
    res.render('newsletter/addNewsletter', { layout: 'staffMain' });
});

router.post('/addNewsletter', (req, res) => {
    let newsletterName = req.body.newsletterName;
    let category = req.body.category;
    let htmlContent = req.body.htmlContent;
    let fileUpload = req.body.fileUpload;
    let status = req.body.status;
    let createdBy = req.body.createdBy;
    Newsletter.create(
        {
            newsletterName, category, htmlContent, fileUpload, status, createdBy
        }
    )
        .then((newsletter) => {
            console.log(newsletter.toJSON());
            res.redirect('/newsletter/listNewsletters');
        })
        .catch(err => console.log(err))
});

// r: retrieve newsletters
router.get('/listNewsletters', (req, res) => {
    Newsletter.findAll({
        raw: true
    })
        .then((newsletters) => {
            res.render('newsletter/listNewsletters', {
                newsletters, layout: 'staffMain', newsletterName: newsletters.newsletterName,
                category: newsletters.category, htmlContent: newsletters.htmlContent, fileUpload: newsletters.fileUpload, status: newsletters.status, createdBy: newsletters.createdBy
            });
        })
        .catch(err => console.log(err));
});

// u: update newsletter


// d: delete newsletter
router.get('/deleteNewsletter/:id', async function (req, res) {
    try {
        let newsletter = await Newsletter.findByPk(req.params.id);
        console.log(req.params.id)
        if (!newsletter) {
            flashMessage(res, 'error', 'Newsletter not found');
            res.redirect('/');
            return;
        }

        // this is to check if the staff in logged in:
        // if (req.subscription.id != req.params.id) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/');
        //     return;
        // }

        let result = await Newsletter.destroy({ where: { id: newsletter.id } });
        console.log(result + ' newsletter deleted');
        flashMessage(res, 'success', 'newsletter successfully deleted');
        res.redirect('/newsletter/listNewsletters');
    }
    catch (err) {
        console.log(err);
    }
});

// upload function
router.post('/upload', (req, res) => {
    // Creates user id directory for upload if not exist
    // if (!fs.existsSync('./public/uploads/' + req.user.id)) {
    //     fs.mkdirSync('./public/uploads/' + req.user.id, {
    //         recursive:
    //             true
    //     });
    // }
    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({
                file: `/uploads/${req.file.filename}`
            });
        }
    });
});

// send newsletter function
router.get('/sendNewsletter/:id', async function (req, res) {
    try {
        let newsletter = await Newsletter.findByPk(req.params.id);
        if (!newsletter) {
            flashMessage(res, 'error', 'Newsletter not found');
            res.redirect('/');
            return;
        }

        // this is to check if the staff in logged in:
        // if (req.subscription.id != req.params.id) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/');
        //     return;
        // }

        else {
            Subscription.findAll({
                raw: true
            })
                .then((subscriptions) => {
                    for (let i = 0; i < subscriptions.length; i++) {
                        let urlDelete = `${process.env.BASE_URL}:${process.env.PORT}/subscription/deleteSub/${subscriptions[i].id}`;
                        let content = newsletter.status;
                        let newsletterName = newsletter.newsletterName;
                        let toEmail = subscriptions[i].email
                        sendEmail2(toEmail, newsletterName, content, urlDelete, "Lim")
                            .then(response => {
                                console.log(response);
                                // flashMessage(res, 'success', subscription.email + ' signed up successfully');
                                // res.redirect('/');
                                res.render('newsletter/message', { message: 'You have subscribed successfully to The Healing Inc. newsletter. Please verify via your email.', card_title: "Subscription Successful", button: "Start Shopping", link: "/" });
                            })
                            .catch(err => {
                                console.log(err);
                                res.render('newsletter/message', { message: 'Error when sending email to ', card_title: "Subscription Unsucessful", button: "Try Again", link: "/subscription/addSub" });
                                // flashMessage(res, 'error', 'Error when sending email to ' + subscription.email);
                                // res.redirect('/');
                            });
                    }
                })
                .catch(err => console.log(err));
                
            // Send email

        }

    }
    catch (err) {
        console.log(err);
    }
});

function sendEmail2(toEmail, newsletterName, content, urlDelete, firstName) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `The Healing Inc. <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: newsletterName,
        html:
            `
		<body style="background-color: #f1ede5; color: black">
		<br><br>
		<!-- start preheader -->
		<div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
			${newsletterName}
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
					<h1 style="text-align: centre; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px; align="center>${newsletterName}</h1>
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
					<p style="margin: 0;">Dear ${firstName}, <br><br></p>
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

module.exports = router;