const express = require('express');
const router = express.Router();
const moment = require('moment');
const flashMessage = require('../helpers/messenger');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const ensureAuthenticatedStaff = require('../helpers/auth2');


router.get('/addVoucher', ensureAuthenticatedStaff, (req, res) => {
    res.render('./voucher/addVoucher', { layout: 'staffMain' });
});

router.post('/addVoucher', ensureAuthenticatedStaff, async function (req, res) {
    let vname = req.body.vname;
    let dtype = req.body.dtype;
    let discount = req.body.discount; //float
    let minspend = req.body.minspend; //float
    let limituse = req.body.limituse; //int
    let code = req.body.code;
    let valid = moment(req.body.valid, 'DD/MM/YYYY');
    let displaydate = moment(valid).format('DD/MM/YYYY');
    let displaytoday = moment().format('DD/MM/YYYY');

    // console.log(displaydate + displaytoday)
    // let valid = req.body.valid;
    let isValid = true;

    if (isNaN(discount)) {
        console.log('discount not digit')
        flashMessage(res, 'error', 'Discount must be in digits');
        isValid = false;
    }

    if (isNaN(minspend)) {
        console.log('minspend not digit')
        flashMessage(res, 'error', 'Minimum Spend must be in digits');
        isValid = false;
    }

    if (isNaN(limituse)) {
        console.log('limituse not digit')
        flashMessage(res, 'error', 'Limit Use must be in digits');
        isValid = false;
    }

    if (parseFloat(limituse)<=0) {
        console.log('limituse 0 below')
        flashMessage(res, 'error', 'Limit Use cannot be 0 or below');
        isValid = false;
    }

    if ((!(displaytoday < displaydate))) {
        console.log('invalid expire date');
        flashMessage(res, 'error', 'Expire date cannot be today or the past dates');
        isValid = false;
    }

    
    if (dtype == "$ off") {
        console.log("$ off d" + discount + " " + minspend)
        if (parseInt(discount) > parseInt(minspend)) {
            console.log('discount more than minspend');
            flashMessage(res, 'error', 'Discount cannot be more than Minimum Spend');
            isValid = false;
        }

        if (parseInt(discount)==parseInt(minspend)) {
            console.log('discount equal minspend');
            flashMessage(res, 'error', 'Discount cannot be equal to Minimum Spend');
            isValid = false;
        }
    }

    if (dtype == "% off") {
        console.log("% off")
        if (discount > 50) {
            console.log('discount more than minspend');
            flashMessage(res, 'error', 'Currently do not allow more than 50% off');
            isValid = false;
        }
    }

    if (discount == 0) {
        flashMessage(res, 'error', 'Discount cannot be 0 or below');
        isValid = false;
    }

    if (minspend < 0 || discount < 0 || limituse < 0) {
        console.log("negative");
        flashMessage(res, 'error', 'Digits cannot be negative value');
        isValid = false;
    }


    if (!isValid) {
        // User.findByPk(req.params.id)
        //     .then((user) => {
        //         res.render('user/editprofile', { user });
        //     })
        //     .catch(err => console.log(err));
        res.render('./voucher/addVoucher', {
            layout: 'staffMain',
            vname, dtype, discount, minspend, limituse, code, valid
        });
        return;
    }



    try {
        let vName = await Voucher.Voucher.findOne({ where: { vname: vname } });
        let Code = await Voucher.Voucher.findOne({ where: { code: code } });

        if (vName) {
            // If vName is found, that means vname has already been registered
            flashMessage(res, 'error', 'Voucher Name: "'+  vname + '" already exists');
            res.render('./voucher/addVoucher', {
                layout: 'staffMain',
                vname, dtype, discount, minspend, limituse, code, valid
            });
        }

        else if (Code) {
            // If code is found, that means code has already been registered
            flashMessage(res, 'error', 'Code: "' + code + '" already exists');
            res.render('./voucher/addVoucher', {
                layout: 'staffMain',
                vname, dtype, discount, minspend, limituse, code, valid
            });
        }

        else {

            Voucher.Voucher.create(
                { vname, discount, dtype, minspend, code, limituse, usecount: 0, valid, invalidtype: "valid" }
            )
            console.log('voucher created')

            flashMessage(res, 'success', vname + ' voucher added successfully');
            res.redirect('/voucher/listVoucher');


        }

    }
    catch (err) {
        console.log(err);
    }

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
});

router.get('/listVoucher', ensureAuthenticatedStaff, (req, res) => {
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


router.get('/editVoucher/:id', ensureAuthenticatedStaff, (req, res) => {
    Voucher.Voucher.findByPk(req.params.id)
        .then((voucher) => {
            if (!voucher) {
                flashMessage(res, 'error', 'Voucher not found');
                res.redirect('/voucher/listVoucher');
                return;
            }
            // if (req.user.id != video.userId) {
            //     flashMessage(res, 'error', 'Unauthorised access');
            //     res.redirect('/video/listVideos');
            //     return;
            // }

            res.render('voucher/editVoucher', { layout: 'staffMain', voucher });
        })
        .catch(err => console.log(err));
});

router.post('/editVoucher/:id', ensureAuthenticatedStaff, async function (req, res)  {
    
    let vname = req.body.vname;
    let dtype = req.body.dtype;
    let discount = req.body.discount; //float
    let minspend = req.body.minspend; //float
    let limituse = req.body.limituse; //int
    let code = req.body.code;
    let valid = moment(req.body.valid, 'DD/MM/YYYY');
    let displaydate = moment(valid).utc().format('DD/MM/YYYY');
    let displaytoday = moment().utc().format('DD/MM/YYYY');
    // let valid = req.body.valid;
    let isValid = true;

    if (isNaN(discount)) {
        console.log('discount not digit')
        flashMessage(res, 'error', 'Discount must be in digits');
        isValid = false;
    }

    if (isNaN(minspend)) {
        console.log('minspend not digit')
        flashMessage(res, 'error', 'Minimum Spend must be in digits');
        isValid = false;
    }

    if (isNaN(limituse)) {
        console.log('limituse not digit')
        flashMessage(res, 'error', 'Limit Use must be in digits');
        isValid = false;
    }

    if (parseFloat(limituse)<=0) {
        console.log('limituse 0 below')
        flashMessage(res, 'error', 'Limit Use cannot be 0 or below');
        isValid = false;
    }

    if ((!(displaytoday < displaydate))) {
        console.log('invalid expire date');
        flashMessage(res, 'error', 'Expire date cannot be today or the past dates');
        isValid = false;
    }


    if (dtype == "$ off") {
        console.log("$ off d" + discount + " " + minspend)
        if (parseInt(discount) > parseInt(minspend)) {
            console.log('discount more than minspend');
            flashMessage(res, 'error', 'Discount cannot be more than Minimum Spend');
            isValid = false;
        }

        if (parseInt(discount)==parseInt(minspend)) {
            console.log('discount equal minspend');
            flashMessage(res, 'error', 'Discount cannot be equal to Minimum Spend');
            isValid = false;
        }
    }

    if (dtype == "% off") {
        console.log("% off")
        if (discount > 50) {
            console.log('discount more than minspend');
            flashMessage(res, 'error', 'Currently do not allow more than 50% off');
            isValid = false;
        }
    }

    if (discount == 0) {
        flashMessage(res, 'error', 'Discount cannot be 0 or below');
        isValid = false;
    }

    if (minspend < 0 || discount < 0 || limituse < 0) {
        console.log("negative");
        flashMessage(res, 'error', 'Digits cannot be negative value');
        isValid = false;
    }


    if (!isValid) {
        Voucher.Voucher.findByPk(req.params.id)
            .then((voucher) => {
                res.render('./voucher/editVoucher', {
                    layout: 'staffMain',
                    vname, dtype, discount, minspend, limituse, code, valid
                });
            })
            .catch(err => console.log(err));
        return;
    }


    try {

        await Voucher.Voucher.findOne({ where: { vname: vname } })
            .then(voucher => {

                if (voucher.id != id) {
                    flashMessage(res, 'error', 'Voucher name: '+vname + 'exists already');
                    isValid = false;
                    // res.render('user/editprofile', { user });
                    // User.findByPk(req.params.id)
                    //     .then((user) => {
                    //         return res.render('user/editprofile', { user });
                    //     })
                    //     .catch(err => console.log(err));
                    // return;    
                }

            })
            .catch(err => console.log(err));

        await Voucher.findOne({ where: { code:code } })
            .then(voucher => {
                if (voucher.id != id) {
                    // If user is found, that means email has already been registered
                    flashMessage(res, 'error', 'Voucher code: '+code + ' exists already');
                    isValid = false;
                }
            })
            .catch(err => console.log(err));


            if (!isValid) {
                Voucher.Voucher.findByPk(req.params.id)
                    .then((voucher) => {
                        res.render('./voucher/editVoucher', {
                            layout: 'staffMain',
                            vname, dtype, discount, minspend, limituse, code, valid
                        });
                    })
                    .catch(err => console.log(err));
                return;
            }
        

    }

    catch (err) {
        console.log(err);
    }

    await Voucher.UserVoucher.findAll({
        where: {voucherId:req.params.id, invalidtype: "valid"},
        
    })
        .then((uservoucher) => {
            console.log("editing voucher for user side");
            uservoucher.forEach(element => {
                // let userId = element.userId;
                let voucherId= element.voucherId;
                // let id = element.id;
                // Voucher.UserVoucher.destroy({ where: { voucherId: voucherId } });
                Voucher.UserVoucher.update(
                    { vname, discount, dtype, minspend, code,  valid,  invalidtype: "valid" , use:0},
                    { where: { voucherId: voucherId } }
                )
                    .then((result) => {
                        console.log('user voucher updated');
                    })
                    .catch(err => console.log(err));
                    
            });
        })


    Voucher.Voucher.update(
        { vname, discount, dtype, minspend, code, limituse, usecount: 0, valid,  invalidtype: "valid" },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' voucher updated');
            flashMessage(res, 'success', ' Voucher edited successfully');
            res.redirect('/voucher/listVoucher');
        })
        .catch(err => console.log(err));
});

router.get('/deleteVoucher/:id', ensureAuthenticatedStaff, async function (req, res) {
    try {
        let voucher = await Voucher.Voucher.findByPk(req.params.id);
        if (!voucher) {
            flashMessage(res, 'error', 'Voucher not found');
            res.redirect('/voucher/listVoucher');
            return;
        }
        // let uservoucher= await Voucher.UserVoucher.findAll({where:{ voucherId:voucher.id}});
        // await uservoucher.destroy();

        await Voucher.UserVoucher.findAll({
            where: {voucherId:voucher.id  },
            
        })
            .then((uservoucher) => {
                console.log("deleting voucher for user side");
                uservoucher.forEach(element => {
                    // let userId = element.userId;
                    let voucherId= element.voucherId;
                    // let id = element.id;
                    Voucher.UserVoucher.destroy({ where: { voucherId: voucherId } });
                        
                });
            })

        let result = await Voucher.Voucher.destroy({ where: { id: voucher.id } });
       
        console.log(result + ' voucher deleted');
        res.redirect('/voucher/listVoucher');
    }
    catch (err) {
        console.log(err);
    }
});

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