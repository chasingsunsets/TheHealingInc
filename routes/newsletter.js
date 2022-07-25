const express = require('express');
const router = express.Router();

// models
const Subscription = require('../models/Subscription');
const Newsletter = require('../models/Newsletter');

// helpers
const upload = require('../helpers/imageUpload');
const flashMessage = require('../helpers/messenger');

// c: create newsletter
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
                purpose: newsletters.purpose, createdBy: newsletters.createdBy, status: newsletters.status, fileUpload: newsletters.fileUpload
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

module.exports = router;