var _           = require("underscore"),
    Account     = require("account"),
    Defs        = require("defs"),
    Zone        = require("zone"),
    Routes      = require("routes");

var Web = module.exports = function(app, gameServer) {
    var self         = this;
    this._gameServer = gameServer;
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
                if (account) {
                  req.session.account  = account;
                  req.session.username = account.getUsername();
                  req.session.myIslandId = account.getIslandZoneId();
                  req.session.isMusicOn = account.isMusicOn();
                }
                else {
                  req.session.destroy();
                }
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
    
    createNewZone: function(req, res, callback) {
        Zone.createNewZone(req.session.account, callback);
    },
    
    startNewIsland: function(req, res, callback) {
        Zone.createNewIsland(req.session.account, callback);
    },
    
    getPortalInfo: function(req, callback) {
      var account = req.session.account;
      var portalTileIdx = req.params.portalTileIdx;
      var zone = this._gameServer.getWorld().getZone(account.getEditorZoneId());
      if (zone) {
        zone.tileAtIndex(portalTileIdx, function(tile){
          if (tile.getType() === "Portal") {
            Zone.findAllForAccount(account, function(zones) {
                callback(tile, portalTileIdx, zones);
            });
          }
        });
      } else {
        callback(null);
      }
    },
    
    setPortalInfo: function(req, callback) {
      var account = req.session.account;
      var portalTileIdx = req.params.portalTileIdx;
      var zone = this._gameServer.getWorld().getZone(account.getEditorZoneId());
      if (zone) {
        zone.tileAtIndex(portalTileIdx, function(tile){
          if (tile.getType() === "Portal") {
            tile.setDestinationZone(req.body.portal.zone);
            if (req.body.portal.dest_coords && req.body.portal.dest_coords !== "") {
              var newCoords = req.body.portal.dest_coords.split(",");
              tile.setDestinationCoords([Number(newCoords[0]), Number(newCoords[1])]);
            } else {
              tile.setDestinationCoords(null);
            }
          }
          callback();
        });
      }
    },
    
    getEditableZones: function(account, callback){
        Zone.findAllForAccount(account, function(zones) {
            callback(zones);
        });
    },

    updateZone: function(zoneId, zoneParams) {
        Zone.findById(zoneId, function(zone) {
            zone.setName(zoneParams.name);
            zone.setDimensions(zoneParams.width, zoneParams.height);
            zone.save();
        });
    }
    
};