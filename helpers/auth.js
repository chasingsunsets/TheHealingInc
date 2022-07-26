const ensureAuthenticated = (req, res, next) => {
    // if (req.isAuthenticated()) {
    //     return next();
    // }

    // if (req.user.type=="customer" && req.isAuthenticated()) {
    //     return next();
    // }

    if (req.isAuthenticated()) {
        if (req.user.type=="customer") {
            return next();
        }
    }
    console.log("NOT AUTHENTICATED CUST");
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