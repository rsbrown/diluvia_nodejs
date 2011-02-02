var auth        = require("connect-auth");

var AuthController = module.exports = function(app) {
    app.use(auth( [
      auth.Facebook({appId : FACEBOOK_ID, appSecret: FACEBOOK_SECRET, scope: "email", callback: FACEBOOK_CALLBACK}),
      auth.Twitter({consumerKey: TWITTER_CONSUMER_KEY, consumerSecret: TWITTER_CONSUMER_SECRET})
    ]) );
};

AuthController.prototype = {
};