const flashMessage = require('./messenger');

const ensureAuthenticatedStaff = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // res.redirect('/staff/login');
    // flashMessage(res, 'error', 'Unauthorised access');
    else {
        console.log("NOT AUTHENTICATED");
        flashMessage(res, 'error', 'Unauthorised access, please login to view.');
        // res.render('./staff/login', { layout: 'stafflogin' });
        res.redirect('/staff/login');
    }
};
module.exports = ensureAuthenticatedStaff