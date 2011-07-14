var _           = require("underscore"),
    Account     = require("account"),
    Defs        = require("defs"),
    Zone        = require("zone"),
    PortalTile  = require("portal_tile"),
    Routes      = require("routes"),
    Fence       = require("fence");

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
        var portalTile = null;
        var fence = new Fence(function(){
          Zone.findAllForAccount(account, function(zones) {
            if (portalTile) {
              callback(portalTile, portalTileIdx, zones);
            } else {
              callback(null, portalTileIdx, zones);
            }
          });
        });
        zone.tileAtIndex(portalTileIdx, fence.tap(function(tile, tileData, layerIndex){
          if (layerIndex === Defs.OBJECT_LAYER) {
            if (tile.portalTile) {
              portalTile = tile;
            }
          }
        }));
      }
    },
    
    setPortalInfo: function(req, callback) {
      var account = req.session.account;
      var portalTileIdx = req.params.portalTileIdx;
      var zone = this._gameServer.getWorld().getZone(account.getEditorZoneId());
      if (zone) {
        var portalTile = null;
        var newCoords = null;
        if (req.body.portal.dest_coords && req.body.portal.dest_coords !== "") {
          var editCoords = req.body.portal.dest_coords.split(",");
          newCoords = [Number(editCoords[0]), Number(editCoords[1])];
        }
        var fence = new Fence(function(){
          if (portalTile == null) {
              zone.getBoard().getLayer(Defs.OBJECT_LAYER).clearTile(portalTileIdx);
              portalTile = new PortalTile({"image": "sprites.png:1,12"});
              var newIdx = zone.addTile(portalTile, "PortalTile");
              zone.getBoard().getLayer(Defs.OBJECT_LAYER).pushTile(portalTileIdx, [ newIdx ]);
          }
          portalTile.setDestinationZone(req.body.portal.zone);
          portalTile.setDestinationCoords(newCoords);
          portalTile.setImage(req.body.portal.image);
          callback();
        });        
        zone.tileAtIndex(portalTileIdx, fence.tap(function(tile, tileData, layerIndex){
          if (layerIndex === Defs.OBJECT_LAYER) {
            if (tile.portalTile) {
              portalTile = tile;
            }
          }
        }));
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