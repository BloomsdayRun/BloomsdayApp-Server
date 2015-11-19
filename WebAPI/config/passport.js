// Load FB Strategy & auth variable
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');

module.exports = function(passport) {

    //Dummy serialization functions needed for session
    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(user, done) {
      done(null, user);
    });

    //MARK: Facebook strategy
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    function(token, refreshToken, profile, done) {

        // Asynchronously log profile, token
        process.nextTick(function() {
            //TODO: This does no validation
            console.log("Profile" + profile.id);
            console.log("Token" + token);
            return done(null, true);

        });

    }));

};
