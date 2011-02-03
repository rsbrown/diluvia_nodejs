var auth        = require("connect-auth");

// This is a temporary stopgap -- remove when everyone's development env.js is caught up -- RB
try { 
    FACEBOOK_ID;
    FACEBOOK_SECRET;
    FACEBOOK_CALLBACK;
    TWITTER_CONSUMER_KEY;
    TWITTER_CONSUMER_SECRET;
} 
catch (e) {
    console.log("Your env.js is out of date, go check env.js.example!");
    process.exit();
}

var AuthController = module.exports = function(app) {
    app.use(auth( [
      auth.Facebook({appId : FACEBOOK_ID, appSecret: FACEBOOK_SECRET, scope: "email", callback: FACEBOOK_CALLBACK}),
      auth.Twitter({consumerKey: TWITTER_CONSUMER_KEY, consumerSecret: TWITTER_CONSUMER_SECRET})
    ]) );
};

AuthController.prototype = {
};