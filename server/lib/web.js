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
    
    setSelectedZone:  function(req, res, next) {
      if (req.user) {
        req.user.getPlayer().setZoneId(req.params.zoneid);
        req.user.getPlayer().setTileIndex(null);
        req.user.save();
      }
      next();
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
      console.log("adding to zone:" + zoneId);
      var portalFromZone = server.getWorld().getZone(zoneId);
      if (portalFromZone && (portalFromZone.getAccountId() == account.getId())) {
        console.log("still adding to zone:" + portalFromZone.getId());
        var newCoords = null;
        if (req.body.portal.dest_coords && req.body.portal.dest_coords !== "") {
          var editCoords = req.body.portal.dest_coords.split(",");
          newCoords = [Number(editCoords[0]), Number(editCoords[1])];
        }
        portalFromZone.portalAtIndex(portalTileIdx, function(portalTile, tileData, layerIndex){
          if (portalTile == null) {
              portalTile = new PortalTile({"image": "sprites.png:1,12"});
              var newIdx = portalFromZone.addTile(portalTile, "PortalTile");
              portalFromZone.getBoard().getLayer(Defs.OBJECT_LAYER).pushTile(portalTileIdx, [ newIdx ]);
              console.log("pushed tile to zone:" + portalFromZone.getId());
          }
          Zone.findById(req.body.portal.zone, function(portalToZone) {
            if (portalToZone) {
              portalTile.setDestinationZone(portalToZone.getId());
              if ( (newCoords[0] <= portalToZone.getDimensions()[0]) && (newCoords[1] <= portalToZone.getDimensions()[1])) {
                portalTile.setDestinationCoords(newCoords);
              }
            }
          });
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
        var zone = this._gameServer.getWorld().getZone(zoneId);
        if (zone && (zone.getAccountId() == account.getId())) {
          zone.setName(zoneParams.name);
          zone.setBackground(zoneParams.background);
          zone.setMusic(zoneParams.music);
          zone.setDimensions(zoneParams.width, zoneParams.height);
          zone.save();
        }
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