var _           = require("underscore"),
    fs          = require("fs"),
    janrain     = require('janrain-api'),
    Account     = require("account"),
    Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    PortalTile  = require("portal_tile"),
    Routes      = require("routes"),
    Fence       = require("fence");

var Web = module.exports = function(app, gameServer) {
    var self         = this;
    this._gameServer = gameServer;
    methods = ["get", "post"];
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
    
    this._musicFiles = [];
    this._backgroundImages = [];
    this._loadMusicFiles();
    this._loadBackgroundImages();
};

Web.prototype = {
    redirectBackOrRoot: function(req, res) {
        if (global["store_location"]) {
            res.redirect(global["store_location"]);
          } else {
            res.redirect("/");
          }
    },
    
    handleJanrainLogin: function(token, req, res) {
      var web = this;
      var engageAPI = janrain(JANRAIN_KEY);
      engageAPI.authInfo(token, true, function(err, data) {
        if(err) {
          res.send(err.message + ( data ? ('  --  ' + JSON.stringify(data)) : ''));
          return;
        }
        
        var existingUserId = data.profile.identifier;
        Account.findByJanrainId(existingUserId, function(foundAccount){
          if (foundAccount) {
            req.session.accountId = foundAccount.getId();
            web.redirectBackOrRoot(req, res);
          } else {
            Account.createViaJanrain(data.profile, function(newAccount){
              req.session.accountId = newAccount.getId();
              web.redirectBackOrRoot(req, res);
            });
          }
        });
      });
    },
    
    getMusicFiles: function() {
      return this._musicFiles;
    },
    
    getBackgroundImages: function() {
      return this._backgroundImages;
    },
    
    _loadFiles: function(dirName, collection) {
      var self = this;
      fs.readdir(dirName, function(err, files) {
          if (err) {
              console.log("Could not find music media directory!");
          }
          else {
              _(files).each(function(filename) {
                if (filename.substr(-4) === ".mp3") {
                  collection.push(filename.substr(0, filename.length-4));
                }
              });
          }
      });
    },
    
    _loadMusicFiles: function() {
      this._loadFiles("public/media/music", this._musicFiles);
    },

    _loadBackgroundImages: function() {
      this._loadFiles("public/images/backgrounds", this._backgroundImages);
    },

    loadUserSession: function(req, res, next) {
        req.session.isMusicOn = !req.cookies.music_off;
        if (req.session.accountId) {
          Account.findById(req.session.accountId, function(foundAccount){
            if (foundAccount) {
              req.user               = foundAccount;
              req.session.myIslandId = req.user.getIslandZoneId();
            }
            next();
          });
        } else {
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
        zone.portalAtIndex(portalTileIdx, function(tile, tileData){
          Zone.findAll(function(zones) {
            Account.findAll(function(accounts) {
              callback(tile, portalTileIdx, zones, accounts);
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
      var portalOriginZone = server.getWorld().getZone(zoneId);
      if (portalOriginZone && (portalOriginZone.getAccountId() == account.getId())) {
        portalOriginZone.portalAtIndex(portalTileIdx, function(portalTile, tileData, layerIndex){
          var tileId = tileData;
          if (portalTile == null) {
              portalTile = Tile.instanceFromDefinition("PortalTile", {"image": "sprites.png:1,12"});
              tileId = portalOriginZone.initTileFromObj(portalTile);
              portalOriginZone.getBoard().getLayer(Defs.OBJECT_LAYER).pushTile(portalTileIdx, tileId);
          }
          Zone.findById(req.body.portal.zone, function(portalDestZone) {
            if (portalDestZone) {
              var newCoords = null;
              if (req.body.portal.dest_coords && req.body.portal.dest_coords !== "") {
                var editCoords = req.body.portal.dest_coords.split(",");
                newCoords = [Number(editCoords[0]), Number(editCoords[1])];
              } else {
                newCoords = [parseInt(portalDestZone.getWidth()/2),parseInt(portalDestZone.getHeight()/2)];
              }
              portalTile.setDestinationZone(portalDestZone.getId());
              if ( (newCoords[0] <= portalDestZone.getDimensions()[0]) && (newCoords[1] <= portalDestZone.getDimensions()[1])) {
                portalTile.setDestinationCoords(newCoords);
              }
            }
          });
          portalTile.setImage(req.body.portal.image);
          callback(tileId);
        });
      }
    },
    
    getEditableZones: function(account, callback){
        Zone.findAllForAccount(account, function(zones) {
            callback(zones);
        });
    },

    updateZone: function(account, zoneId, zoneParams, callback) {
        var server = this._gameServer;
        var zone = this._gameServer.getWorld().getZone(zoneId);
        if (zone && (zone.getAccountId() == account.getId())) {
          zone.setName(zoneParams.name);
          zone.setBackground(zoneParams.background);
          zone.setMusic(zoneParams.music);
          zone.setDimensions(zoneParams.width, zoneParams.height);
          zone.save(callback);
        }
    },
    
    updateAccount: function(req) {
      var account = req.user;
      account.setUsername(req.body.account.username);
      account.save();
    }
    
};