var _           = require("underscore"),
    Account     = require("account"),
    Routes      = require("routes");

var Web = module.exports = function(app) {
    var self = this;
    
    // Bind all the routes
    _(Routes).each(function(val, key) { 
        if (val.get) {app.get(key, _(val.get).bind(self))};
        if (val.post) {app.get(key, _(val.post).bind(self))};
    });
};

Web.prototype = {
    redirectBackOrRoot: function(req, res) {
        if (global["store_location"]) {
            res.redirect(global["store_location"]);
          } else {
            res.redirect("/");
          }
    },
    
    loadUserSession: function(req, res, callback) {
        if (req.session.accountId) {
            Account.findById(req.session.accountId, function(account){
                req.session.username = account.getUsername();
                req.session.isMusicOn = account.isMusicOn();
                callback(true);
            });
        } else {
            req.session.isMusicOn = true;
            callback(false);
        }
    },

    getAccountFromFacebookAuth: function(authInfo, callback) {
        var facebookUserId = authInfo["user"]["id"];
        Account.findByFacebookId(facebookUserId, function(foundAccount){
            if (foundAccount) {
                callback(foundAccount);
            } else {
                Account.create({
                    "facebookUserId": facebookUserId,
                    "username": authInfo["user"]["name"]
                }, function(newAccount){
                    callback(newAccount);
                });
            }
        });
    }
};