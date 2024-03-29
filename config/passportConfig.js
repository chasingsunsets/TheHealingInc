const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

function localStrategy(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
            User.findOne({ where: { username: username, type:"customer" } })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'No User Found' });
                    }
                    // Match password
                    isMatch = bcrypt.compareSync(password, user.password);
                    if (!isMatch) {
                        return done(null, false, {
                            message: 'Password incorrect'
                        });
                    }
                    // Email Verified
                    if (!user.verified) {
                        return done(null, false, { message: 'Email not verified' });
                    }
                    return done(null, user);
                })
        }));
    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((user, done) => {
        // user.id is used to identify authenticated user
        done(null, user.id);
    });
    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId)
            .then((user) => {
                done(null, user);
                // user object saved in req.session
            })
            .catch((done) => {
                // No user found, not stored in req.session
                console.log(done);
            });
    });


}

function localStrategy2(passport) {
    passport.use("local.two",
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
            User.findOne({ where: { username: username, type:"staff" } })
                .then(staff => {
                    if (!staff) {
                        return done(null, false, { message: 'No User Found' });
                    }
                    // Match password
                    isMatch = bcrypt.compareSync(password, staff.password);
                    if (!isMatch) {
                        return done(null, false, {
                            message: 'Password incorrect'
                        });
                    }
                    return done(null, staff);
                })
        }));
        
    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((staff, done) => {
        // user.id is used to identify authenticated user
        done(null, staff.id);
    });
    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((staffId, done) => {
        User.findByPk(staffId)
            .then((staff) => {
                done(null, staffId);
                // user object saved in req.session
            })
            .catch((done) => {
                // No user found, not stored in req.session
                console.log(done);
            });
    });
}
module.exports = { localStrategy, localStrategy2 };