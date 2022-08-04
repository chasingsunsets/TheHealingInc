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
    User.findOne({ where: { email: "thehealinginctester@gmail.com" } })
        .then(staff => {

            if (!staff) {
                // Create main staff
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync("sssssss", salt);
                // Use hashed password
                User.create({ type:"staff", username: "staff", firstname: "John", lastname: "Tan", email: "thehealinginctester@gmail.com", password: hash });
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

router.get('/register', ensureAuthenticatedStaff, (req, res) => {
    res.render('./staff/register', { layout: 'staffMain', username: req.username, id: req.id});
});

router.post('/register', ensureAuthenticatedStaff, async function (req, res) {

    let { username, firstname, lastname, email, password, password2 } = req.body;
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
        res.render('./staff/register', {
            layout: 'staffMain',
            username, firstname, lastname, email
        });
        return;
    }

    try {
        
        // If all is well, checks if user is already registered
        let staffe = await User.findOne({ where: { email: email, type:"staff"} });
        let staffn = await User.findOne({ where: { username: username, type:"staff"} });

        if (staffe) {
            // If staff is found, that means email has already been registered
            flashMessage(res, 'error', email + ' already registered');
            res.render('./staff/register', {
                layout: 'staffMain',
                 username, firstname, lastname, email
            });
        }

        else if (staffn) {
            // If staff is found, that means username has already been registered
            flashMessage(res, 'error', username + ' already registered');
            res.render('./staff/register', {
                layout: 'staffMain',
                 username, firstname, lastname, email
            });
        }
        else {
            // Create new staff record
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let staff = await User.create({ type:"staff", username, firstname, lastname, email, password: hash });
            flashMessage(res, 'success', username + ' registered successfully');
            res.redirect('/staff/dashboard');
        }
    }
    catch (err) {
        console.log(err);
    }

});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/staff/login');
    });
});

router.get('/profile', ensureAuthenticatedStaff, (req, res) => {

    res.render('staff/profile', { layout: 'staffMain', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, email: req.user.email, id: req.user.id });
});


router.get('/editProfile/:id', ensureAuthenticatedStaff, (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {

            if (!user) {
                flashMessage(res, 'error', 'Invalid access');
                res.redirect('/staff/profile');
                return;
            }

            if (req.user.id != req.params.id) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/staff/profile');
                return;
            }

            res.render('staff/editProfile', { user, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

////////////////////////////

router.post('/editProfile/:id', ensureAuthenticatedStaff, async function (req, res) {
    let id = req.params.id;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let email = req.body.email;

    let isValid = true;

    try {

        await User.findOne({ where: { email: email, type: "staff" } })
            .then(user => {

                if (user.id != id) {
                    // If user is found, that means email has already been registered
                    flashMessage(res, 'error', email + ' already registered');
                    isValid = false; 
                }

            })
            .catch(err => console.log(err));

        await User.findOne({ where: { username: username, type: "staff" } })
            .then(user => {
                if (user.id != id) {
                    // If user is found, that means email has already been registered
                    flashMessage(res, 'error', username + ' already registered');
                    isValid = false;

                }
            })
                .catch(err => console.log(err));
                
    if (!isValid) {
        User.findByPk(req.params.id)
            .then((user) => {
                res.render('staff/editProfile', { layout: 'staffMain', user });
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
            { firstname, lastname, username, email },
            { where: { id: req.params.id, type: "staff" } }
        )
            .then((result) => {
                console.log(result[0] + ' profile updated');
                flashMessage(res, 'success', ' Profile edited successfully');
                res.redirect('/staff/profile');
            })
            .catch(err => console.log(err));

    });

////////////////////////////////////////////////////





router.get('/changePW/:id', ensureAuthenticatedStaff, (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {

            if (!user) {
                flashMessage(res, 'error', 'Invalid access');
                res.redirect('/staff/profile');
                return;
            }

            if (req.user.id != req.params.id) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/staff/profile');
                return;
            }

            res.render('staff/changePW', { layout: 'staffMain', user, username: req.user.username });
        })
        .catch(err => console.log(err));
});

router.post('/changePW/:id', ensureAuthenticatedStaff, (req, res) => {

    let password = req.body.password;
    let password2 = req.body.password2;
    let password3 = req.body.password3;

    let isValid = true;

    User.findOne({ where: { username: req.user.username,type:"staff" } })
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
                        res.render('staff/changePW', {layout: 'staffMain', user});
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
                    res.redirect('/staff/profile');
                })
                .catch(err => console.log(err));


        })
        .catch(err => console.log(err));
    return;
});




router.get('/deleteprofile/:id', ensureAuthenticatedStaff, async function (req, res) {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/staff/profile');
            return;
        }

        if (req.user.id != req.params.id) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/staff/profile');
            return;
        }

        let result = await User.destroy({ where: { id: user.id } });
        console.log(result + ' account deleted');
        flashMessage(res, 'success', 'Account successfully deleted');
        res.redirect('/staff/login');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/listCust', ensureAuthenticatedStaff, (req, res) => {
    User.findAll({
        where: { type: "customer" },
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

router.get('/listStaff',ensureAuthenticatedStaff, (req, res) => {
    User.findAll({
        where: { type: "staff" },
        // order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((staffs) => {
            // pass object to listVideos.handlebar
            res.render('staff/listStaff', { staffs, layout: 'staffMain', firstname: staffs.firstname, lastname: staffs.lastname, username: staffs.username, email: staffs.email, id: staffs.id });
        })
        .catch(err => console.log(err));
    // res.render('./staff/listCust', { layout: 'staffMain', user: req.user, firstname: req.user.firstname, lastname: req.user.lastname, username: req.user.username, phoneno: req.user.phoneno, address: req.user.address, email: req.user.email, id: req.user.id });
});

router.get('/editCust/:id', ensureAuthenticatedStaff, (req, res) => {
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

router.post('/editCust/:id',ensureAuthenticatedStaff, (req, res) => {
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

router.get('/deleteaccount/:id', ensureAuthenticatedStaff, async function (req, res) {
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


router.get('/editStaff/:id', ensureAuthenticatedStaff, (req, res) => {
    User.findByPk(req.params.id)
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

router.post('/editStaff/:id',ensureAuthenticatedStaff, (req, res) => {
    let staffno = req.body.staffno;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let email = req.body.email;

    let password = req.body.password;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    User.update(
        { staffno, firstname, lastname, username, email, password: hash },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' profile updated');
            res.redirect('/staff/listStaff');
        })
        .catch(err => console.log(err));
});

router.get('/deletestaff/:id',ensureAuthenticatedStaff, async function (req, res) {
    try {
        let staff = await User.findByPk(req.params.id);
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


        let result = await User.destroy({ where: { id: staff.id } });
        console.log(result + ' account deleted');
        flashMessage(res, 'success', 'Account successfully deleted');
        res.redirect('/staff/listStaff');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/dashboard', ensureAuthenticatedStaff, (req, res) => {
    res.render('./staff/dashboard', { layout: 'staffMain' });
});


router.get('/listCustOrder',ensureAuthenticatedStaff, async (req, res) => {
    const orders = await Order.Order.findAll({
        order: [['createdat', 'DESC']],
        raw: true
    })
    res.render('./staff/listCustOrder', {layout: 'staffMain' ,orders});
});

module.exports = router;