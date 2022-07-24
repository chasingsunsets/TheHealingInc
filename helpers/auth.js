const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login');
};

// const ensureAuthenticatedStaff = (req, res, next) => {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     // res.redirect('/staff/login');
//     res.render('./staff/login', { layout: 'stafflogin' });
// };
module.exports = ensureAuthenticated

//,ensureAuthenticatedStaff;