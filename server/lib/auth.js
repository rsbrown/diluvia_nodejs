var auth        = require("connect-auth"),
    OAuth       = require('oauth').OAuth;

var Auth = module.exports = function(app) {
    try {
        var keys = require('./auth_keys');
        for(var key in keys) {
            global[key] = keys[key];
        }
    }
    catch(e) {
        console.log('Unable to locate the auth_keys.js file');
        return;
    }

    var twitterSecrets = {consumerKey: twitterConsumerKey, consumerSecret: twitterConsumerSecret};
    app.use(auth([auth.Twitter(twitterSecrets)]));    
};