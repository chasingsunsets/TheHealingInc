const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const User = require('../models/User');
const bcrypt = require('bcryptjs');

const passport = require('passport');

const ensureAuthenticated = require('../helpers/auth');

// Required for email verification
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');


router.get('/login', (req, res) => {
    res.render('user/login');
});

router.get('/register', (req, res) => {
    res.render('user/register');
});

function sendEmail(toEmail, url) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `The Healing Inc. <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Verify Healing Inc Account',
        html: `Thank you registering with the Healing Inc.<br><br> Please
    <a href=\"${url}"><strong>verify</strong></a> your account.`
    };
    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

router.get('/verify/:userId/:token', async function (req, res) {
    let id = req.params.userId;
    let token = req.params.token;
    try {
        // Check if user is found
        let user = await User.findByPk(id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/user/login');
            return;
        }
        // Check if user has been verified
        if (user.verified) {
            flashMessage(res, 'info', 'User already verified');
            res.redirect('/user/login');
            return;
        }
        // Verify JWT token sent via URL
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData != user.email) {
            flashMessage(res, 'error', 'Unauthorised Access');
            res.redirect('/user/login');
            return;
        }
        let result = await User.update(
            { verified: 1 },
            { where: { id: user.id } });
        console.log(result[0] + ' user updated');
        flashMessage(res, 'success', user.email + ' verified. Please login');
        res.redirect('/user/login');
    }
    catch (err) {
        console.log(err);
    }
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
            let user = await User.create({ type: "customer", firstname, lastname, username, phoneno, address, email, password: hash, verified: 0 });

            // Send email
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/verify/${user.id}/${token}`;
            sendEmail(user.email, url)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', user.email + ' registered successfully');
                    res.redirect('/user/login');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' +
                        user.email);
                    res.redirect('/');
                });



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

    res.render('user/profile', { layout: 'account', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, phoneno: req.user.phoneno, address: req.user.address, email: req.user.email, id: req.user.id });
});

router.get('/editprofile/:id', ensureAuthenticated, (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {

            if (!user) {
                flashMessage(res, 'error', 'Invalid access');
                res.redirect('/user/profile');
                return;
            }

            if (req.user.id != req.params.id) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/user/profile');
                return;
            }

            res.render('user/editprofile', { user });
        })
        .catch(err => console.log(err));
});

router.post('/editprofile/:id', ensureAuthenticated, async function (req, res) {
    let id = req.params.id;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let phoneno = req.body.phoneno;
    let address = req.body.address;
    let email = req.body.email;

    let isValid = true;

    if (phoneno.length != 8) {
        flashMessage(res, 'error', 'Phone number must be 8 digits');
        isValid = false;
    }

    if (!isValid) {
        User.findByPk(req.params.id)
            .then((user) => {
                res.render('user/editprofile', { user });
            })
            .catch(err => console.log(err));
        return;
    }


    try {

        await User.findOne({ where: { email: email, type: "customer" } })
            .then(user => {

                if (user.id != id) {
                    // If user is found, that means email has already been registered
                    flashMessage(res, 'error', email + ' already registered');
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

        await User.findOne({ where: { username: username, type: "customer" } })
            .then(user => {
                if (user.id != id) {
                    // If user is found, that means email has already been registered
                    flashMessage(res, 'error', username + ' already registered');
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
                
    if (!isValid) {
        User.findByPk(req.params.id)
            .then((user) => {
                res.render('user/editprofile', { user });
            })
            .catch(err => console.log(err));
        return;
    }
    }

    catch (err) {
        console.log(err);
    }

            User.update(
            // { firstname, lastname, username, phoneno, address, email, password: hash },
            { firstname, lastname, username, phoneno, address, email },
            { where: { id: req.params.id, type: "customer" } }
        )
            .then((result) => {
                console.log(result[0] + ' profile updated');
                flashMessage(res, 'success', ' Profile edited successfully');
                res.redirect('/user/profile');
            })
            .catch(err => console.log(err));

    });



router.get('/changepw/:id', ensureAuthenticated, (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {

            if (!user) {
                flashMessage(res, 'error', 'Invalid access');
                res.redirect('/user/profile');
                return;
            }

            if (req.user.id != req.params.id) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/user/profile');
                return;
            }

            res.render('user/changepw', { user, username: req.user.username });
        })
        .catch(err => console.log(err));
});

router.post('/changepw/:id', ensureAuthenticated, (req, res) => {

    let password = req.body.password;
    let password2 = req.body.password2;
    let password3 = req.body.password3;

    let isValid = true;

    User.findOne({ where: { username: req.user.username, } })
        .then(user => {
            // Match password
            isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                // return done(null, false, {
                //     message: 'Current Password incorrect' 
                // });
                flashMessage(res, 'error', 'Current Password incorrect');
                // res.render('user/changepw', { user });   
                isValid = false;
            }

            if (password2.length < 6) {
                flashMessage(res, 'error', 'Password must be at least 6 characters');
                isValid = false;
            }
            if (password2 != password3) {
                flashMessage(res, 'error', 'New Passwords do not match');
                isValid = false;
            }

            if (!isValid) {
                User.findByPk(req.params.id)
                    .then((user) => {
                        res.render('user/changepw', { user });
                    })
                    .catch(err => console.log(err));
                return;
            }


            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password2, salt);

            User.update(
                // { firstname, lastname, username, phoneno, address, email, password: hash },
                { password: hash },
                { where: { id: req.params.id } }
            )
                .then((result) => {
                    console.log(result[0] + ' pw updated');
                    flashMessage(res, 'success', ' Password changed successfully');
                    res.redirect('/user/profile');
                })
                .catch(err => console.log(err));


        })
        .catch(err => console.log(err));
    return;




    // if (password2.length < 6) {
    //     flashMessage(res, 'error', 'Password must be at least 6 characters');
    //     isValid = false;
    // }
    // if (password2 != password3) {
    //     flashMessage(res, 'error', 'Passwords do not match');
    //     isValid = false;
    // }

    // if (!isValid) {
    //     User.findByPk(req.params.id)
    //         .then((user) => {
    //             res.render('user/changepw', { user });
    //         })
    //         .catch(err => console.log(err));
    //     return;
    // }

    // var salt = bcrypt.genSaltSync(10);
    // var hash = bcrypt.hashSync(password2, salt);

    // User.update(
    //     // { firstname, lastname, username, phoneno, address, email, password: hash },
    //     { password: hash },
    //     { where: { id: req.params.id } }
    // )
    //     .then((result) => {
    //         console.log(result[0] + ' pw updated');
    //         flashMessage(res, 'success', ' Password changed successfully');
    //         res.redirect('/user/profile');
    //     })
    //     .catch(err => console.log(err));
});






router.get('/deleteaccount/:id', ensureAuthenticated, async function (req, res) {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/user/profile');
            return;
        }

        if (req.user.id != req.params.id) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/user/profile');
            return;
        }


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