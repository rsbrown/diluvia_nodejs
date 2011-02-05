var _           = require("underscore"),
    Account     = require("account"),
    Routes      = require("routes");

var Web = module.exports = function(app) {
    var self = this;
    
    // Bind all the routes
    _(Routes).each(function(val, key) { 
        app.get(key, _(val).bind(self));
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
                callback();
            });
        } else {
            req.session.isMusicOn = true;
            callback();
        }
    },

    preParseRequest: function(req, res) {
        if (!req.session.flash) {
            req.session.flash = {};
        }
        if (!req.session.flash.error) {req.session.flash.error = false;}
        if (!req.session.flash.warning) {req.session.flash.warning = false;}
        if (!req.session.flash.info) {req.session.flash.info = false;}
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