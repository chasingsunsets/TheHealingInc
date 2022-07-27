const express = require('express');
const router = express.Router();

// models
const Subscription = require('../models/Subscription');
const Newsletter = require('../models/Newsletter');

// helpers
const newsletterUpload = require('../helpers/newsletterImageUpload');
const flashMessage = require('../helpers/messenger');
const fs = require('fs');

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
    let posterURL = req.body.posterURL;
    let status = req.body.status;
    let createdBy = req.body.createdBy;
    Newsletter.create(
        {
            newsletterName, category, htmlContent, posterURL, status, createdBy
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
router.get('/editNewsletter/:id', (req, res) => {
    Newsletter.findByPk(req.params.id)
        .then((newsletter) => {
            res.render('newsletter/editNewsletter', { newsletter, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.post('/editNewsletter/:id', (req, res) => {
    let newsletterName = req.body.newsletterName;
    let category = req.body.category;
    let htmlContent = req.body.htmlContent;
    let posterURL = req.body.posterURL;
    let status = req.body.status;
    let createdBy = req.body.createdBy;
    Newsletter.update(
        {
            newsletterName, category, htmlContent, posterURL, status, createdBy
        },
        { where: { id: req.params.id } }
    )
        .then((newsletter) => {
            console.log(newsletter[0] + ' newsletter updated');
            flashMessage(res, 'success', 'Newsletter Issue: ' + newsletterName + ' has been updated');
            res.redirect('/newsletter/listNewsletters');
        })
        .catch(err => console.log(err));
});


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
        flashMessage(res, 'success', 'Newsletter successfully deleted');
        res.redirect('/newsletter/listNewsletters');
    }
    catch (err) {
        console.log(err);
    }
});

// upload function
router.post('/upload', (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/newsletterUploads/' + req.newsletter.id)) {
        fs.mkdirSync('./public/newsletterUploads/' + req.newsletter.id, {
            recursive:
                true
        });
    }

    newsletterUpload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({
                file: `/newsletterUploads/${req.newsletter.id}/${req.file.filename}`
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

        else {
            Subscription.findAll({
                raw: true
            })
                .then((subscriptions) => {
                    if (subscriptions.length == 0)
                    {
                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "There is currently no subscribers in your subscription list.", button: "Return", link: "/newsletter/listNewsletters" });
                    }
                    for (let i = 0; i < subscriptions.length; i++) {
                        let urlDelete = `${process.env.BASE_URL}:${process.env.PORT}/subscription/deleteSub/${subscriptions[i].id}`;
                        let htmlContent = newsletter.htmlContent;
                        let newsletterName = newsletter.newsletterName;
                        let toEmail = subscriptions[i].email
                        pathToAttachment = './public/' + newsletter.posterURL;
                        attachment = fs.readFileSync(pathToAttachment).toString("base64");
                        if (subscriptions[i].verified == 1)
                        {
                            sendEmail2(toEmail, newsletterName, htmlContent, urlDelete)
                                .then(response => {
                                    console.log(response);
                                    // flashMessage(res, 'success', subscription.email + ' signed up successfully');
                                    // res.redirect('/');
                                    res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Newsletter Sent Successfully", card_title2: "Newsletter Details:", message1: "ID = " + newsletter.id, message2: "Newsletter Name = " + newsletter.newsletterName, button: "Return", link: "/newsletter/listNewsletters" });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Newsletter Sent Unsucessfully", card_title2: "Newsletter Details:", message1: "ID = " + newsletter.id, message2: "Newsletter Name = " + newsletter.newsletterName, button: "Return", link: "/newsletter/listNewsletters" });
                                    // flashMessage(res, 'error', 'Error when sending email to ' + subscription.email);
                                    // res.redirect('/');
                                });
                        }
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

function sendEmail2(toEmail, newsletterName, htmlContent, urlDelete, firstName) {
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

			<!-- start copy block -->
			<tr>
			<td align="center" bgcolor="#f1ede5">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

				<!-- start copy -->
				<tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<p style="margin: 0;">${htmlContent}</p>
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
		`,
        attachments: [
            {
                content: attachment,
                filename: "attachment.jpeg",
                type: "image/png,image/jpeg,image/jpg,image/gif",
                disposition: "attachment"
            }
        ]
    };

    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

module.exports = router;