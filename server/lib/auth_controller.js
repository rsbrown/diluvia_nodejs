var auth        = require("connect-auth");

// *************************
// SORRY, SHOULD HAVE MENTIONED THIS: COPY THESE FROM env.js.example TO env.js -- SB
// *************************
// var FACEBOOK_ID             = FACEBOOK_ID || null;
// var FACEBOOK_SECRET         = FACEBOOK_SECRET || null;
// var FACEBOOK_CALLBACK       = FACEBOOK_CALLBACK || function() { };
// var TWITTER_CONSUMER_KEY    = TWITTER_CONSUMER_KEY || null;
// var TWITTER_CONSUMER_SECRET = TWITTER_CONSUMER_SECRET || null;

var AuthController = module.exports = function(app) {
    app.use(auth( [
      auth.Facebook({appId : FACEBOOK_ID, appSecret: FACEBOOK_SECRET, scope: "email", callback: FACEBOOK_CALLBACK}),
      auth.Twitter({consumerKey: TWITTER_CONSUMER_KEY, consumerSecret: TWITTER_CONSUMER_SECRET})
    ]) );
};

AuthController.prototype = {
};