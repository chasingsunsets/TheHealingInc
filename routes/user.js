const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const User = require('../models/User');
const bcrypt = require('bcryptjs');

const passport = require('passport');

const ensureAuthenticated = require('../helpers/auth');

router.get('/login', (req, res) => {
    res.render('user/login');
});
router.get('/register', (req, res) => {
    res.render('user/register');
});

router.post('/register', async function (req, res) {

    let { firstname, lastname, username, phoneno, address, email, password, password2 } = req.body;
    let isValid = true;
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password != password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        isValid = false;
    }
    if (phoneno.length != 8) {
        flashMessage(res, 'error', 'Phone number must be 8 digits');
        isValid = false;
    }

    if (!isValid) {
        res.render('user/register', {
            firstname, lastname, username, phoneno, address, email
        });
        return;
    }
    // flashMessage(res, 'success', email + ' registered successfully');
    // res.redirect('/user/login');
    try {
        // If all is well, checks if user is already registered
        let user = await User.findOne({ where: { email: email } });
        let usern = await User.findOne({ where: { username: username } });

        if (user) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', email + ' already registered');
            res.render('user/register', {
                firstname, lastname, username, phoneno, address, email
            });
        }

        else if (usern) {
            // If user is found, that means username has already been registered
            flashMessage(res, 'error', username + ' already registered');
            res.render('user/register', {
                firstname, lastname, username, phoneno, address, email
            });
        }
        else {
            // Create new user record
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let user = await User.create({ firstname, lastname, username, phoneno, address, email, password: hash });
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

router.get('/profile', ensureAuthenticated, (req, res) => {

    res.render('user/profile', { title: 'Profile', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, phoneno: req.user.phoneno, address: req.user.address, email: req.user.email, id: req.user.id });
});

router.get('/editprofile/:id', ensureAuthenticated, (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {
            // if (req.user.id != user.userId) {
            //     flashMessage(res, 'error', 'Unauthorised access');
            //     res.redirect('/user/login');
            //     return;
            //     }

            res.render('user/editprofile', { user });
        })
        .catch(err => console.log(err));
});

router.post('/editprofile/:id', ensureAuthenticated, (req, res) => {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let phoneno = req.body.phoneno;
    let address = req.body.address;
    let email = req.body.email;
    let password = req.body.password;

    User.update(
        { firstname, lastname, username, phoneno, address, email, password },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' profile updated');
            res.redirect('/user/profile');
        })
        .catch(err => console.log(err));
});

router.get('/deleteaccount/:id', ensureAuthenticated, async function (req, res) {
    try {
        let user = await User.findByPk(req.params.id);
        // if (!user) {
        //     flashMessage(res, 'error', 'Video not found');
        //     res.redirect('/video/listVideos');
        //     return;
        // }

        // if (req.user.id != user.userId) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/user/login');
        //     return;
        // }
        let result = await User.destroy({ where: { id: user.id } });
        console.log(result + ' account deleted');
        flashMessage(res, 'success', 'Account successfully deleted');
        res.redirect('/user/login');
    }
    catch (err) {
        console.log(err);
    }
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