var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
    // Passport session setup
    passport.serializeUser(function(user, done) {
	done(null, {username: user.username});
    });

    passport.deserializeUser(function(userData, done) {
	if (userData.username !== "daniela")
	    return done(new Error("User not found"));

	done(null, userData);
    });

    // Passport strategy setup
    passport.use(new LocalStrategy(
	function(username, password, done) {
	    process.nextTick(function () {
		// Normally, I would query the db here and look for the user and hashed password to see if they match.
		// For now, i just assume that I only have a user called "daniela""
		if (username !== "daniela") {
		    return done(null, false);
		}
		var user = {username: "daniela"};
		return done(null, user);
	    });
	}
    ));
};
