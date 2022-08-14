const express = require('express');
const router = express.Router();

// models
const Subscription = require('../models/Subscription');
const Newsletter = require('../models/Newsletter');

// helpers
const newsletterUpload = require('../helpers/newsletterImageUpload');
const flashMessage = require('../helpers/messenger');
const fs = require('fs');
const ensureAuthenticatedStaff = require('../helpers/auth2');
const moment = require('moment');

// api
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// testing summernote:
router.get('/summernote', (req, res) => {
    res.render('newsletter/summernote', { layout: 'staffMain' });
});

verifiedList = []

// c: create newsletter
router.get('/addNewsletter', ensureAuthenticatedStaff, (req, res) => {
    res.render('newsletter/addNewsletter', { layout: 'staffMain' });
});

router.post('/addNewsletter', ensureAuthenticatedStaff, (req, res) => {
    let newsletterName = req.body.newsletterName;
    let category = req.body.category;
    let htmlContent = req.body.htmlContent;
    let posterURL = req.body.posterURL;
    let status = req.body.status;
    let schedule = null;
    let createdBy = req.body.createdBy;
    Newsletter.create(
        {
            newsletterName, category, htmlContent, posterURL, schedule, status, createdBy
        }
    )
        .then((newsletter) => {
            console.log(newsletter.toJSON());
            res.redirect('/newsletter/listNewsletters');
        })
        .catch(err => console.log(err))
});

// r: retrieve newsletters
router.get('/listNewsletters', ensureAuthenticatedStaff, (req, res) => {
    draftTab = []
    completedTab = []
    sentTab = []
    scheduleTab = []
    Newsletter.findAll({
        raw: true
    })
        .then((newsletters) => {
            for (i in newsletters) {
                if (newsletters[i].status == "Draft") {
                    draftTab.push(newsletters[i])
                }
                else if (newsletters[i].status == "Completed" & newsletters[i].schedule != null)
                {
                    scheduleTab.push(newsletters[i])
                }
                else if (newsletters[i].status == "Completed")
                {
                    completedTab.push(newsletters[i])
                }
                else if (newsletters[i].status == "Sent")
                {
                    sentTab.push(newsletters[i])
                }
            }
            // console.log(draftTab)
            // console.log(sentTab);
            // console.log(scheduleTab)
            res.render('newsletter/listNewsletters', {
                newsletters, layout: 'staffMain', draftTab, completedTab, sentTab, scheduleTab, newsletterName: newsletters.newsletterName,
                category: newsletters.category, htmlContent: newsletters.htmlContent, fileUpload: newsletters.fileUpload, status: newsletters.status, createdBy: newsletters.createdBy
            });
        })
        .catch(err => console.log(err));
});

// u: update newsletter
router.get('/editNewsletter/:id', ensureAuthenticatedStaff, (req, res) => {
    Newsletter.findByPk(req.params.id)
        .then((newsletter) => {
            res.render('newsletter/editNewsletter', { newsletter, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.post('/editNewsletter/:id', ensureAuthenticatedStaff, (req, res) => {
    let newsletterName = req.body.newsletterName;
    let category = req.body.category;
    let htmlContent = req.body.htmlContent;
    let posterURL = req.body.posterURL;
    let status = req.body.status;
    let schedule = null;
    let createdBy = req.body.createdBy;
    Newsletter.update(
        {
            newsletterName, category, htmlContent, posterURL, schedule, status, createdBy
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

// u: schedule
router.get('/scheduleNewsletter/:id', ensureAuthenticatedStaff, (req, res) => {
    Newsletter.findByPk(req.params.id)
        .then((newsletter) => {
            console.log(newsletter.newsletterName);
            Subscription.findAll({
                raw: true
            })
                .then((subscriptions) => {
                    // check for verified users in the subscriptions
                    for (i in subscriptions) {
                        // console.log(subscriptions[i])
                        verifiedList.push(subscriptions[i].verified)
                    }

                    if (subscriptions.length == 0) {
                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "There is currently no subscribers in your subscription list.", button: "Return", link: "/newsletter/listNewsletters" });
                    }

                    else if (!verifiedList.includes(1)) {
                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "There is currently no subscribers in your subscription list who are verified.", button: "Return", link: "/newsletter/listNewsletters" });
                    }

                    else {
                        for (let i = 0; i < subscriptions.length; i++) {
                            let unSubURL = `${process.env.BASE_URL}:${process.env.PORT}/subscription/deleteSub/${subscriptions[i].id}`;
                            let htmlContent = newsletter.htmlContent;
                            let subject = newsletter.newsletterName;
                            let toEmail = subscriptions[i].email;
                            let firstName = subscriptions[i].firstName;
                            console.log(newsletter.createdBy)
                            let lastName = subscriptions[i].lastName;
                            let unixTime = moment(newsletter.schedule).unix();
                            console.log(unixTime)
                            pathToAttachment = './public/' + Newsletter.posterURL;
                            attachment = fs.readFileSync(pathToAttachment).toString("base64");

                            if (subscriptions[i].verified == 1) {
                                sendEmail1(toEmail, subject, firstName, lastName, htmlContent, unSubURL, attachment, unixTime)
                                    .then(response => {
                                        console.log(response);
                                        let result = Newsletter.update(
                                            { status: "Sent" },
                                            { where: { id: newsletter.id } });
                                        console.log(result, newsletter.newsletterName + ' newsletter updated');
                                        // flashMessage(res, 'success', subscription.email + ' signed up successfully');
                                        // res.redirect('/');
                                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Newsletter Sent Successfully", card_title2: "Newsletter Details:", message1: "ID = " + newsletter.id, message2: "Newsletter Name = " + newsletter.newsletterName, button: "Return", link: "/newsletter/listNewsletters" });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "An error occurred.", button: "Return", link: "/newsletter/listNewsletters" });
                                        // flashMessage(res, 'error', 'Error when sending email to ' + subscription.email);
                                        // res.redirect('/');
                                    });
                            }
                        }
                    }
                })
                .catch(err => console.log(err));
            res.render('newsletter/scheduleNewsletter', { newsletter, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.post('/scheduleNewsletter/:id', ensureAuthenticatedStaff, (req, res) => {
    let newsletterName = req.body.newsletterName;
    let category = req.body.category;
    let htmlContent = req.body.htmlContent;
    let posterURL = req.body.posterURL;
    let status = req.body.status;
    let schedule = moment(req.body.schedule, 'DD/MM/YYYY');
    let createdBy = req.body.createdBy;
    Newsletter.update(
        {
            newsletterName, category, htmlContent, posterURL, schedule, status, createdBy
        },
        { where: { id: req.params.id } }
    )
        .then((newsletter) => {
            // console.log(newsletter.newsletterName);
            // Subscription.findAll({
            //     raw: true
            // })
            //     .then((subscriptions) => {
            //         // check for verified users in the subscriptions
            //         for (i in subscriptions) {
            //             // console.log(subscriptions[i])
            //             verifiedList.push(subscriptions[i].verified)
            //         }

            //         if (subscriptions.length == 0) {
            //             res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "There is currently no subscribers in your subscription list.", button: "Return", link: "/newsletter/listNewsletters" });
            //         }

            //         else if (!verifiedList.includes(1)) {
            //             res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "There is currently no subscribers in your subscription list who are verified.", button: "Return", link: "/newsletter/listNewsletters" });
            //         }

            //         else {
            //             for (let i = 0; i < subscriptions.length; i++) {
            //                 let unSubURL = `${process.env.BASE_URL}:${process.env.PORT}/subscription/deleteSub/${subscriptions[i].id}`;
            //                 let htmlContent = newsletter.htmlContent;
            //                 let subject = newsletter.newsletterName;
            //                 let toEmail = subscriptions[i].email;
            //                 let firstName = subscriptions[i].firstName;
            //                 console.log(newsletter.createdBy)
            //                 let lastName = subscriptions[i].lastName;
            //                 let unixTime = moment(newsletter.schedule).unix();
            //                 console.log(unixTime)
            //                 pathToAttachment = './public/' + Newsletter.posterURL;
            //                 attachment = fs.readFileSync(pathToAttachment).toString("base64");

            //                 if (subscriptions[i].verified == 1) {
            //                     sendEmail1(toEmail, subject, firstName, lastName, htmlContent, unSubURL, attachment, unixTime)
            //                         .then(response => {
            //                             console.log(response);
            //                             let result = Newsletter.update(
            //                                 { status: "Sent" },
            //                                 { where: { id: newsletter.id } });
            //                             console.log(result, newsletter.newsletterName + ' newsletter updated');
            //                             // flashMessage(res, 'success', subscription.email + ' signed up successfully');
            //                             // res.redirect('/');
            //                             res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Newsletter Sent Successfully", card_title2: "Newsletter Details:", message1: "ID = " + newsletter.id, message2: "Newsletter Name = " + newsletter.newsletterName, button: "Return", link: "/newsletter/listNewsletters" });
            //                         })
            //                         .catch(err => {
            //                             console.log(err);
            //                             res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "An error occurred.", button: "Return", link: "/newsletter/listNewsletters" });
            //                             // flashMessage(res, 'error', 'Error when sending email to ' + subscription.email);
            //                             // res.redirect('/');
            //                         });
            //                 }
            //             }
            //         }
            //     })
            //     .catch(err => console.log(err));
            console.log(newsletter[0] + ' newsletter scheduled');
            // console.log(moment(schedule).unix()); // Gives UNIX timestamp)
            flashMessage(res, 'success', 'Newsletter has been scheduled.');
            res.redirect('/newsletter/listNewsletters');
        })
        .catch(err => console.log(err));
});

// d: delete newsletter
router.get('/deleteNewsletter/:id', ensureAuthenticatedStaff, async function (req, res) {
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
router.get('/sendNewsletter/:id', ensureAuthenticatedStaff, async function (req, res) {
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
                    // check for verified users in the subscriptions
                    for (i in subscriptions) {
                        // console.log(subscriptions[i])
                        verifiedList.push(subscriptions[i].verified)
                    }

                    if (subscriptions.length == 0)
                    {
                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "There is currently no subscribers in your subscription list.", button: "Return", link: "/newsletter/listNewsletters" });
                    }

                    else if (!verifiedList.includes(1)) 
                    {
                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "There is currently no subscribers in your subscription list who are verified.", button: "Return", link: "/newsletter/listNewsletters" });
                    }
                    
                    else 
                    {
                        for (let i = 0; i < subscriptions.length; i++) {
                            let unSubURL = `${process.env.BASE_URL}:${process.env.PORT}/subscription/deleteSub/${subscriptions[i].id}`;
                            let htmlContent = newsletter.htmlContent;
                            let subject = newsletter.newsletterName;
                            let toEmail = subscriptions[i].email;
                            let firstName = subscriptions[i].firstName;
                            let lastName = subscriptions[i].lastName;
                            pathToAttachment = './public/' + newsletter.posterURL;
                            attachment = fs.readFileSync(pathToAttachment).toString("base64");

                            if (subscriptions[i].verified == 1) {
                                sendEmail2(toEmail, subject, firstName, lastName, htmlContent, unSubURL, attachment)
                                    .then(response => {
                                        console.log(response);
                                        let result = Newsletter.update(
                                            { status: "Sent" },
                                            { where: { id: newsletter.id } });
                                        console.log(result, newsletter.newsletterName + ' newsletter updated');
                                        // flashMessage(res, 'success', subscription.email + ' signed up successfully');
                                        // res.redirect('/');
                                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Newsletter Sent Successfully", card_title2: "Newsletter Details:", message1: "ID = " + newsletter.id, message2: "Newsletter Name = " + newsletter.newsletterName, button: "Return", link: "/newsletter/listNewsletters" });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.render('newsletter/newsletterMessage', { layout: 'staffMain', card_title: "Unable To Send Newsletter", card_title2: "Reason(s):", message1: "An error occurred.", button: "Return", link: "/newsletter/listNewsletters" });
                                        // flashMessage(res, 'error', 'Error when sending email to ' + subscription.email);
                                        // res.redirect('/');
                                    });
                            }
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

function sendEmail2(toEmail, subject, firstName, lastName, htmlContent, unSubURL, attachment) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `The Healing Inc. <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: subject,
        html:
        `
		<body style="background-color: #f1ede5; color: black">
		<br><br>
		<!-- start preheader -->
		<div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
			${subject}
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
					<td align="left" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<h2 style="margin: 0; text-align:center;">${subject}</h2>
					</td>
				</tr>
				<!-- end copy -->

				</table>
			</td>
			</tr>

			<tr>
			<td align="center" bgcolor="#f1ede5">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
				<!-- start copy -->
				<tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<p style="margin: 0;">Dear ${firstName} ${lastName}, </p>
                    <p style="margin: 0;">${htmlContent}</p>
					</td>             
				</tr>

                <tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<p style="margin: 0;">Warmest Regards, </p>
                    <p style="margin: 0;">The Healing Inc. Team</p>
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
					<p style="margin: 0;"><a href="${unSubURL}" target="_blank">Unsubscribe Here</a></p>
					</td>
				</tr>
				<!-- end permission -->
				</table>
			</td>
			</tr>
			<!-- end footer -->

		</table>
		`,
        files: [
            {
                filename: "attachment.jpeg",
                type: 'image/png,image/jpeg,image/jpg,image/gif',
                cid: 'myimagecid',
                content: attachment,
                disposition: 'inline'
            }
        ],
        attachments: [
            {
                content: attachment,
                filename: "attachment.jpeg",
                type: "image/png,image/jpeg,image/jpg,image/gif",
                disposition: "attachment",
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

function sendEmail1(toEmail, subject, firstName, lastName, htmlContent, unSubURL, attachment, unixTime) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `The Healing Inc. <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: subject,
        html:
            `
		<body style="background-color: #f1ede5; color: black">
		<br><br>
		<!-- start preheader -->
		<div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
			${subject}
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
					<td align="left" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<h2 style="margin: 0; text-align:center;">${subject}</h2>
					</td>
				</tr>
				<!-- end copy -->

				</table>
			</td>
			</tr>

			<tr>
			<td align="center" bgcolor="#f1ede5">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
				<!-- start copy -->
				<tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<p style="margin: 0;">Dear ${firstName} ${lastName}, </p>
                    <p style="margin: 0;">${htmlContent}</p>
					</td>             
				</tr>

                <tr>
					<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
					<p style="margin: 0;">Warmest Regards, </p>
                    <p style="margin: 0;">The Healing Inc. Team</p>
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
					<p style="margin: 0;"><a href="${unSubURL}" target="_blank">Unsubscribe Here</a></p>
					</td>
				</tr>
				<!-- end permission -->
				</table>
			</td>
			</tr>
			<!-- end footer -->

		</table>
		`,
        sendAt: 1660502000,
        files: [
            {
                filename: "attachment.jpeg",
                type: 'image/png,image/jpeg,image/jpg,image/gif',
                cid: 'myimagecid',
                content: attachment,
                disposition: 'inline'
            }
        ],
        attachments: [
            {
                content: attachment,
                filename: "attachment.jpeg",
                type: "image/png,image/jpeg,image/jpg,image/gif",
                disposition: "attachment",
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