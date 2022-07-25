const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const Staff = require('../models/Staff');
const User = require('../models/User');

const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticatedStaff = require('../helpers/auth2');

router.get('/login', (req, res) => {
    try {
    Staff.findOne({ where: { staffno: 000000 } })
        .then(staff => {

            if (!staff) {
                // Create main staff
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync("mainstaff101", salt);
                // Use hashed password
                Staff.create({ staffno: 000000, username: "staff", firstname: "John", lastname: "Tan", email: "thehealinginctester@gmail.com", password: hash });
                console.log(' staff acc created');
                res.render('./staff/login', { layout: 'stafflogin' });
                return;
            }
            res.render('./staff/login', { layout: 'stafflogin' });
            
        });
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local.two', {
        // Success redirect URL
        successRedirect: '/staff/dashboard',
        // Failure redirect URL
        failureRedirect: '/staff/login',
        /* Setting the failureFlash option to true instructs Passport to flash
        an error message using the message given by the strategy's verify callback.
        When a failure occur passport passes the message object as error */
        failureFlash: true
    })(req, res, next);
});

router.get('/register', (req, res) => {
    res.render('./staff/register', { layout: 'staffMain', username: req.username, id: req.id});
});

router.post('/register', async function (req, res) {

    let { staffno, username, firstname, lastname, email, password, password2 } = req.body;
    let isValid = true;
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password != password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        isValid = false;
    }
    if (staffno.length != 6) {
        flashMessage(res, 'error', 'Invalid Staff Number');
        isValid = false;
    }

    // if (staffno.slice(-1)= 6) {
    //     flashMessage(res, 'error', 'Staff Number must be 6 characters');
    //     isValid = false;
    // }

    // if (Number.isInteger(staffno.substring(0, 4))!=true) {
    //     flashMessage(res, 'error', 'Staff Number must be 6 characters');
    //     isValid = false;
    // }

    if (!isValid) {
        res.render('./staff/register', {
            layout: 'staffMain',
            staffno, username, firstname, lastname, email
        });
        return;
    }

    try {
        // If all is well, checks if user is already registered
        let staff = await Staff.findOne({ where: { staffno: staffno } });
        let staffe = await Staff.findOne({ where: { email: email } });
        let staffn = await Staff.findOne({ where: { username: username } });

        if (staff) {
            // If staff is found, that means staffno has already been registered
            flashMessage(res, 'error', staffno + ' already registered');
            res.render('./staff/register', {
                layout: 'staffMain',
                staffno, username, firstname, lastname, email
            });
        }

        else if (staffe) {
            // If staff is found, that means email has already been registered
            flashMessage(res, 'error', email + ' already registered');
            res.render('./staff/register', {
                layout: 'staffMain',
                staffno, username, firstname, lastname, email
            });
        }

        else if (staffn) {
            // If staff is found, that means username has already been registered
            flashMessage(res, 'error', username + ' already registered');
            res.render('./staff/register', {
                layout: 'staffMain',
                staffno, username, firstname, lastname, email
            });
        }
        else {
            // Create new staff record
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let staff = await Staff.create({ staffno, username, firstname, lastname, email, password: hash });
            flashMessage(res, 'success', username + ' registered successfully');
            res.redirect('/staff/login');
        }
    }
    catch (err) {
        console.log(err);
    }

});

router.get('/listCust', (req, res) => {
    User.findAll({
        // where: { userId: req.user.id },
        // order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((users) => {
            // pass object to listVideos.handlebar
            res.render('staff/listCust', { users, layout: 'staffMain', firstname: users.firstname, lastname: users.lastname, username: users.username, phoneno: users.phoneno, address: users.address, email: users.email, id: users.id });
        })
        .catch(err => console.log(err));
    // res.render('./staff/listCust', { layout: 'staffMain', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, phoneno: req.user.phoneno, address: req.user.address, email: req.user.email, id: req.user.id });
});

router.get('/listStaff', (req, res) => {
    Staff.findAll({
        // where: { userId: req.user.id },
        // order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((staffs) => {
            // pass object to listVideos.handlebar
            res.render('staff/listStaff', { staffs, layout: 'staffMain', firstname: staffs.firstname, lastname: staffs.lastname, username: staffs.username, staffno: staffs.staffno, email: staffs.email, id: staffs.id });
        })
        .catch(err => console.log(err));
    // res.render('./staff/listCust', { layout: 'staffMain', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, phoneno: req.user.phoneno, address: req.user.address, email: req.user.email, id: req.user.id });
});

router.get('/editCust/:id', (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {

            if (!user) {
                flashMessage(res, 'error', 'Invalid access');
                res.redirect('/staff/listCust');
                return;
            }

            // if (req.user.id != req.params.id) {
            //     flashMessage(res, 'error', 'Unauthorised access');
            //     res.redirect('/staff/listCust');
            //     return;
            //     }

            res.render('staff/editCust', { user, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.post('/editCust/:id', (req, res) => {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let phoneno = req.body.phoneno;
    let address = req.body.address;
    let email = req.body.email;

    let password = req.body.password;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    User.update(
        { firstname, lastname, username, phoneno, address, email, password: hash },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' profile updated');
            res.redirect('/staff/listCust');
        })
        .catch(err => console.log(err));
});

router.get('/deleteaccount/:id', async function (req, res) {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/staff/listCust');
            return;
        }

        // if (req.user.id != req.params.id) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/staff/listCust');
        //     return;
        // }


        let result = await User.destroy({ where: { id: user.id } });
        console.log(result + ' account deleted');
        flashMessage(res, 'success', 'Account successfully deleted');
        res.redirect('/staff/listCust');
    }
    catch (err) {
        console.log(err);
    }
});


router.get('/editStaff/:id', (req, res) => {
    Staff.findByPk(req.params.id)
        .then((staff) => {

            if (!staff) {
                flashMessage(res, 'error', 'Invalid access');
                res.redirect('/staff/listStaff');
                return;
            }

            // if (req.user.id != req.params.id) {
            //     flashMessage(res, 'error', 'Unauthorised access');
            //     res.redirect('/staff/listCust');
            //     return;
            //     }

            res.render('staff/editStaff', { staff, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.post('/editStaff/:id', (req, res) => {
    let staffno = req.body.staffno;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let email = req.body.email;

    let password = req.body.password;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    Staff.update(
        { staffno, firstname, lastname, username, email, password: hash },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' profile updated');
            res.redirect('/staff/listStaff');
        })
        .catch(err => console.log(err));
});

router.get('/deletestaff/:id', async function (req, res) {
    try {
        let staff = await Staff.findByPk(req.params.id);
        if (!staff) {
            flashMessage(res, 'error', 'Staff not found');
            res.redirect('/staff/listStaff');
            return;
        }

        // if (req.user.id != req.params.id) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/staff/listCust');
        //     return;
        // }


        let result = await Staff.destroy({ where: { id: staff.id } });
        console.log(result + ' account deleted');
        flashMessage(res, 'success', 'Account successfully deleted');
        res.redirect('/staff/listStaff');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/dashboard', (req, res) => {
    res.render('./staff/dashboard', { layout: 'staffMain' });
});

module.exports = router;