const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');

const passport = require('passport');

const ensureAuthenticatedStaff = require('../helpers/auth');

router.get('/login', (req, res) => {
    res.render('./staff/login', { layout: 'stafflogin' });
});

router.get('/register', (req, res) => {
    res.render('./staff/register', { layout: 'staffMain' });
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

router.get('/dashboard', (req, res) => {
    res.render('./staff/dashboard', { layout: 'staffMain' });
});







// router.post('/flash', (req, res) => {
// 	const message = 'This is an important message';
// 	const error = 'This is an error message';
// 	const error2 = 'This is the second error message';
// 	// req.flash('message', message);
// 	// req.flash('error', error);
// 	// req.flash('error', error2);
// 	flashMessage(res, 'success', message);
// 	flashMessage(res, 'info', message);
// 	flashMessage(res, 'error', error);
// 	flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);
// 	res.redirect('/');
// });


module.exports = router;