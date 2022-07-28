const flashMessage = require('./messenger');
// const User = require('../models/User');

const ensureAuthenticatedStaff = (req, res, next) => {
    // if (req.isAuthenticated()) {
    //     return next();
    // }
    // if (User.findByPk(req, { where: { type: "staff"} })) {
    //     return next();
    // }
    // if (req.user.type=="staff" && req.isAuthenticated()) {
    //     return next();
    // }
    
    if (req.isAuthenticated()) {
        if (req.user.type=="staff") {
            return next();
        }
        else {
            console.log("NOT AUTHENTICATED STAFF");
            flashMessage(res, 'error', 'Unauthorised access, please login to view.');
            // res.render('./staff/login', { layout: 'stafflogin' });
            res.redirect('/staff/login');
        }
    }
    // res.redirect('/staff/login');
    // flashMessage(res, 'error', 'Unauthorised access');
    else {
        console.log("NOT AUTHENTICATED STAFF");
        flashMessage(res, 'error', 'Unauthorised access, please login to view.');
        // res.render('./staff/login', { layout: 'stafflogin' });
        res.redirect('/staff/login');
    }
};
module.exports = ensureAuthenticatedStaff