const express = require('express');
const router = express.Router();
const moment = require('moment');
const flashMessage = require('../helpers/messenger');
const Voucher = require('../models/Voucher');
const User = require('../models/User');


router.get('/addVoucher', (req, res) => {
    res.render('./voucher/addVoucher', { layout: 'staffMain' });
});

router.post('/addVoucher', (req, res) => {
    let vname = req.body.vname;
    let dtype = req.body.dtype;
    let discount = req.body.discount;
    let minspend = req.body.minspend;
    let limituse= req.body.limituse;
    let code = req.body.code;
    let valid = moment(req.body.valid, 'DD/MM/YYYY');
    let displaydate = moment(valid).utc().format('DD/MM/YYYY');
    // let valid = req.body.valid;


    
    // User.findAll({
    //     where: { type:"customer" },
    //     // order: [['dateRelease', 'DESC']],
    //     raw: true
    // })
    //     .then((user) => {
            
    //         Voucher.create(
    //             { vname, discount, minspend, code, valid, used: 0, userID:user.id}
    //         )
    //         flashMessage(res, 'success', vname + ' voucher added successfully');
    //         // pass object to listVideos.handlebar
    //         res.render('voucher/listVoucher', { layout: 'staffMain'});
    //     })
    //     .catch(err => console.log(err)); 

    Voucher.Voucher.create(
        { vname,discount,dtype,minspend,code,limituse,usecount:0,valid,displaydate, invalidtype: "valid"  }
    )
    flashMessage(res, 'success', vname + ' voucher added successfully');
    res.redirect('/voucher/listVoucher');
});

router.get('/listVoucher', (req, res) => {
    Voucher.Voucher.findAll({
        // where: { userId: req.user.id },
        // order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((vouchers) => {
            // pass object to listVideos.handlebar
            res.render('voucher/listVoucher', { vouchers, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
    // res.render('./staff/listCust', { layout: 'staffMain', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, phoneno: req.user.phoneno, address: req.user.address, email: req.user.email, id: req.user.id });
});


// router.get('/editVideo/:id', ensureAuthenticated, (req, res) => {
//     Video.findByPk(req.params.id)
//         .then((video) => {
//             if (!video) {
//                 flashMessage(res, 'error', 'Video not found');
//                 res.redirect('/video/listVideos');
//                 return;
//             }
//             if (req.user.id != video.userId) {
//                 flashMessage(res, 'error', 'Unauthorised access');
//                 res.redirect('/video/listVideos');
//                 return;
//             }

//             res.render('video/editVideo', { video });
//         })
//         .catch(err => console.log(err));
// });

// router.post('/editVideo/:id', ensureAuthenticated, (req, res) => {
//     let title = req.body.title;
//     let story = req.body.story.slice(0, 1999);
//     let starring = req.body.starring;
//     let posterURL = req.body.posterURL;
//     let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
//     let language = req.body.language.toString();
//     let subtitles = req.body.subtitles === undefined ? '' : req.body.subtitles.toString();
//     let classification = req.body.classification;

//     Video.update(
//         { title, story, starring, posterURL, classification, language, subtitles, dateRelease },
//         { where: { id: req.params.id } }
//     )
//         .then((result) => {
//             console.log(result[0] + ' video updated');
//             res.redirect('/video/listVideos');
//         })
//         .catch(err => console.log(err));
// });

// router.get('/deleteVideo/:id', ensureAuthenticated, async function (req, res) {
//     try {
//         let video = await Video.findByPk(req.params.id);
//         if (!video) {
//             flashMessage(res, 'error', 'Video not found');
//             res.redirect('/video/listVideos');
//             return;
//         }
//         if (req.user.id != video.userId) {
//             flashMessage(res, 'error', 'Unauthorised access');
//             res.redirect('/video/listVideos');
//             return;
//         }

//         let result = await Video.destroy({ where: { id: video.id } });
//         console.log(result + ' video deleted');
//         res.redirect('/video/listVideos');
//     }
//     catch (err) {
//         console.log(err);
//     }
// });

// router.get('/omdb', ensureAuthenticated, (req, res) => {
//     let apikey = process.env.OMDB_API_KEY;
//     let title = req.query.title;
//     fetch(`https://www.omdbapi.com/?t=${title}&apikey=${apikey}`)
//         .then(res => res.json())
//         .then(data => {
//             console.log(data);
//             res.json(data);
//         });
// });

// router.post('/upload', ensureAuthenticated, (req, res) => {
//     // Creates user id directory for upload if not exist
//     if (!fs.existsSync('./public/uploads/' + req.user.id)) {
//         fs.mkdirSync('./public/uploads/' + req.user.id, { recursive: true });
//     }

//     upload(req, res, (err) => {
//         if (err) {
//             // e.g. File too large
//             res.json({ file: '/img/no-image.jpg', err: err });
//         }
//         else {
//             res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
//         }
//     });
// });

module.exports = router;