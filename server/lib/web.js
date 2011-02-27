var _           = require("underscore"),
    Account     = require("account"),
    Zone        = require("zone"),
    Routes      = require("routes");

var Web = module.exports = function(app) {
    var self = this;
    methods = ["get", "post"]
    // Bind all the routes
    _(Routes).each(function(val, key) {
        for (i in methods) {
            var method = methods[i];
            if (val[method]) {
                var middleware = [];
                for (i in val[method].middleware) {
                    middleware[i] = self[val[method].middleware[i]];
                }
                app[method]( key, middleware, _(val[method].exec).bind(self))
            }
        }
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
    
    loadUserSession: function(req, res, next) {
        if (req.session.accountId) {
            Account.findById(req.session.accountId, function(account){
                req.session.account  = account;
                req.session.username = account.getUsername();
                req.session.myIslandId = account.getIslandZoneId();
                req.session.isMusicOn = account.isMusicOn();
                next();
            });
        } else {
            req.session.isMusicOn = true;
            next();
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
    },
    
    getIslands: function(req, res, callback) {
        islands = [];
        Account.findAll(function(accounts) {
            for (i in accounts) {
                var islandId = accounts[i].getIslandZoneId();
                if (islandId !== undefined) {
                    islands.push(accounts[i]);
                }
            }
            callback(islands);
        });
    },
    
    startNewIsland: function(req, res, callback) {
        Zone.createNewIsland(req.session.account, function(){
            callback();
        });
    },
    
    getZones: function(callback){
        return Zone.findAll(function(zones) {
            callback(zones);
        });
    },
    
    updateZone: function(zoneConfig) {
        zone = Zone.findById(zoneConfig.id, function(zone) {
            console.log("\n\n***");
            console.log(zone);
        });
    }
    
};