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
        if (req.user) {
          req.session.accountId  = req.user.getId();
          req.session.myIslandId = req.user.getIslandZoneId();
          req.session.isMusicOn  = req.user.isMusicOn();
          next();
        } else {
          req.session.isMusicOn = true;
          next();
        }
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
        Zone.createNewZone(req.user, callback);
    },
    
    startNewIsland: function(req, res, callback) {
        Zone.createNewIsland(req.user, callback);
    },
    
    getPortalInfo: function(req, callback) {
      var account = req.user;
      var portalTileIdx = req.params.portalTileIdx;
      var zone = this._gameServer.getWorld().getZone(account.getEditorZoneId());
      if (zone) {
        zone.portalAtIndex(portalTileIdx, function(tile, tileData, layerIndex){
          Zone.findAll(function(zones) {
            Account.findAll(function(accounts) {
              if (tile) {
                callback(tile, portalTileIdx, zones, accounts);
              } else {
                callback(null, portalTileIdx, zones, accounts);
              }
            });
          });
        });
      }
    },
    
    setPortalInfo: function(req, callback) {
      var account = req.user;
      var server = this._gameServer;
      var portalTileIdx = req.params.portalTileIdx;
      var zoneId = account.getEditorZoneId();
      var zone = server.getWorld().getZone(zoneId);
      if (zone && (zone.getAccountId() == account.getId())) {
        var newCoords = null;
        if (req.body.portal.dest_coords && req.body.portal.dest_coords !== "") {
          var editCoords = req.body.portal.dest_coords.split(",");
          newCoords = [Number(editCoords[0]), Number(editCoords[1])];
        }
        zone.portalAtIndex(portalTileIdx, function(portalTile, tileData, layerIndex){
          if (portalTile == null) {
              portalTile = new PortalTile({"image": "sprites.png:1,12"});
              var newIdx = zone.addTile(portalTile, "PortalTile");
              zone.getBoard().getLayer(Defs.OBJECT_LAYER).pushTile(portalTileIdx, [ newIdx ]);
          }
          portalTile.setDestinationZone(req.body.portal.zone);
          portalTile.setDestinationCoords(newCoords);
          portalTile.setImage(req.body.portal.image);
          server.addUnsavedEdit(account.getId(), zoneId);
          callback();
        });
      }
    },
    
    getEditableZones: function(account, callback){
        Zone.findAllForAccount(account, function(zones) {
            callback(zones);
        });
    },

    updateZone: function(account, zoneId, zoneParams) {
        var server = this._gameServer;
        Zone.findById(zoneId, function(zone) {
          if (zone && (zone.getAccountId() == account.getId())) {
            zone.setName(zoneParams.name);
            zone.setDimensions(zoneParams.width, zoneParams.height);
            zone.save();
          }
        });
    },
    
    saveEditorState: function(accountId, callback) {
      var server = this._gameServer;
      var zoneList = server.getUnsavedEdits(accountId);
      var fence = new Fence(callback);
      for (i in zoneList) {
        var zone = this._gameServer.getWorld().getZone(zoneList[i]);
        zone.save(function(){
          console.log("SAVED ZONE " + zone.getId());
        });
      }
      server.clearUnsavedEdits(accountId);
    }
    
};