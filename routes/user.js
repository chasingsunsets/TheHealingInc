const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const User = require('../models/User');
const bcrypt = require('bcryptjs');

const passport = require('passport');

router.get('/login', (req, res) => {
    res.render('user/login');
});
router.get('/register', (req, res) => {
    res.render('user/register');
});

router.post('/register', async function (req, res) {
    let { name, email, password, password2 } = req.body;
    let isValid = true;
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password != password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        isValid = false;
    }
    if (!isValid) {
        res.render('user/register', {
            name, email
        });
        return;
    }
    // flashMessage(res, 'success', email + ' registered successfully');
    // res.redirect('/user/login');
    try {
        // If all is well, checks if user is already registered
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', email + ' already registered');
            res.render('user/register', {
                name, email
            });
        }
        else {
            // Create new user record
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let user = await User.create({ name, email, password: hash });
            flashMessage(res, 'success', email + ' registered successfully');
            res.redirect('/user/login');
        }
    }
    catch (err) {
        console.log(err);
    }

});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Success redirect URL
        successRedirect: '/user/profile',
        // Failure redirect URL
        failureRedirect: '/user/login',
        /* Setting the failureFlash option to true instructs Passport to flash
        an error message using the message given by the strategy's verify callback.
        When a failure occur passport passes the message object as error */
        failureFlash: true
    })(req, res, next);
});

// router.get('/logout', (req, res) => {
//         req.logout();
//         res.redirect('/');
//         });  here broken, fix found online was:
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/profile', (req, res) => {

    res.render('user/profile');
});

module.exports = router;

// router.get('/listVideos', (req, res) => {
//     Video.findAll({
//     where: { userId: req.user.id },
//     order: [['dateRelease', 'DESC']],
//     raw: true
//     })
//     .then((videos) => {
//     // pass object to listVideos.handlebar
//     res.render('video/listVideos', { videos });
//     })
//     .catch(err => console.log(err));
//     });