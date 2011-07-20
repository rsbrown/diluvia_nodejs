var io          = require("socket.io"),
    _           = require("underscore"),
    Defs        = require("defs"),
    Client      = require("client"),
    World       = require("world"),
    Zone        = require("zone"),
    Account     = require("account"),
    PortalTile  = require("portal_tile"),
    Routes      = require("routes");

var GameServer = module.exports = function(app) {
    this._app          = app;
    this._world        = new World();
    this._world.on("loaded", _(this._onWorldLoaded).bind(this));
};

GameServer.prototype = {
    _onWorldLoaded: function() {
        this._socket = io.listen(this._app, {timeout: 1000});
        this._socket.enable('browser client minification');
        this._socket.set('log level', 3);
        this._socket.set('transports', [
            'websocket'
          // , 'flashsocket'
          // , 'htmlfile'
          , 'xhr-polling'
          // , 'jsonp-polling'
        ]);
        
        this._socket.sockets.on("connection", _(this._onConnect).bind(this));
    },
    
    _onConnect: function(conn) {
        var server  = this,
            client  = new Client(conn);
        
        client.on("receivedHandshakeRequest", function(sessionId) {
            server.initAccount(client, sessionId);
        });
        
        client.on("startGame", function(sessionId) {
            server.loadGame(client.getAccount());
        });

        client.on("initWorldView", function(sessionId) {
            server.loadEditor(client.getAccount());
        });

        conn.on("message", function(msg) { client.onMessage(msg); });
        conn.on("disconnect", function() { client.onDisconnect(); });
    },
    
    initAccount: function(client, sessionId) {
        var self = this;
        Account.initFromSession(sessionId, function(account){
            // var alreadyLoggedInAccount = world.getAccountById(account.getId());
            // console.log(alreadyLoggedInAccount);
            // if (alreadyLoggedInAccount) {
            //     alreadyLoggedInAccount.kick();
            // }
            account.setClient(client);
            client.setAccount(account);
            client.completeHandshake(self.serverInfo());
        });
    },
    
    loadGame: function(account){
        this._world.connectPlayer(account, this, this.bindActorEvents);
    },
    
    loadEditor: function(account){
        this.bindEditorEvents(account);
    },
    
    bindActorEvents: function(account){
        var world   = this._world,
            client  = account.getClient(),
            actor   = account.getPlayer(),
            zone    = world.getZone(actor.getZoneId());

        console.log("INIT GAMEPLAY SESSION FOR USER " + account.getUsername());
        world.broadcastMessage(Defs.CHAT_SYSTEM, account.getUsername() + " connected.");
        
        client.sendZoneData(zone);
        client.sendZoneState(world.composeZoneStateFor(account, zone.getStateAttributes()));
        client.sendScoreUpdate(account.getScore());

        account.on("changeScore", function(score) {
            client.sendScoreUpdate(score);
        });

        actor.on("changeZone", function() {
            var zoneId = actor.getZoneId();
            if (zoneId) {
                var zone = world.getZone(zoneId);
                client.sendZoneData(zone);
                client.sendZoneState(world.composeZoneStateFor(account, zone.getStateAttributes()));
            }
        });
        
        actor.on("changeRole", function() {
            client.sendFlash("yellow");
        });

        actor.on("landed", function() {
            client.sendFlash("black");
        });
        
        client.on("receivedCommand", function(command) {
            var zoneId  = actor.getZoneId();
            if (zoneId !== undefined) {
                var zone = world.getZone(zoneId);

                if (command == "n" || command == "s" || command == "e" || command == "w") {
                    zone.command(actor, command);
                }
                else if (command == "suicide") {
                    world.accountDeath(account);
                }
                else if (command == "StopMusic" || command == "StartMusic") {
                    account.setSoundOn((command == "StartMusic"));
                    account.save();
                }
                else {
                    world.otherCommand(account, zone, command);
                }
            }
        });

        client.on("receivedChat", function(text) {
            world.broadcastChat(account.getUsername(), text);
        });
    },
    
    bindEditorEvents: function(account){
        var client  = account.getClient(),
            self    = this,
            world   = this._world,
            zone    = world.getZone(account.getEditorZoneId()) || world.getZone(account.getIslandZoneId());

        console.log("INIT EDITOR SESSION FOR USER " + account.getUsername());
        
        account.setEditorViewTileIndex(zone.getCenterTileIndex());
        client.sendZoneData(zone);
        client.sendZoneState(world.composeZoneStateFor(account, zone.getStateAttributes()));
        
        client.on("centerEditorView", function(index) {
            var zoneId  = account.getEditorZoneId();
            if (zoneId !== undefined) {
                var zone = world.getZone(zoneId);
                zone.centerEditor(account, index);
            }
        });
        
        client.on("switchZone", function(zoneId) {
          var newZone = world.getZone(zoneId);
          if ((newZone !== undefined) && (newZone.getAccountId() == account.getId())) {
            account.setEditorZoneId(zoneId);
            account.setEditorViewTileIndex(newZone.getCenterTileIndex());
            account.save(function(){
              client.sendZoneData(newZone);
              client.sendZoneState(world.composeZoneStateFor(account, newZone.getStateAttributes()));
            });
          }
        });
        
        client.on("saveZone", function(zoneId, zoneData) {
          var updatedConfig = {};
          Zone.findById(zoneId, function(zone){
            if (zone && (zone.getAccountId() == account.getId())) {
              updatedConfig.background = zone.getBackground();
              updatedConfig.music = zone.getMusic();
              for (i in Zone.MAP_LAYER_KEYS) {
                var layerLabel = Zone.MAP_LAYER_KEYS[i];
                updatedConfig[layerLabel] = [];
                for (j in zoneData.layers[i]) {
                  var tile = zoneData.layers[i][j];
                  if (tile) {
                    var tileId = zoneData.layers[i][j][0][0];
                    if (isNaN(tileId)) {
                      // console.log("->"+tileId+"<-");
                      var tileDef = world.getZone(zoneId).getTile(tileId);
                      // console.log(tileDef);
                      updatedConfig[layerLabel][j] = tileDef.serializable();
                    } else {
                      updatedConfig[layerLabel][j] = parseInt(tileId);
                    }
                  } else {
                    updatedConfig[layerLabel][j] = null;
                  }
                }
              }
              zone.setConfig(updatedConfig);
              zone.save(function(){
                console.log("SAVED ZONE " + zone.getId());
              });
            }
          });
        });
        
    },
    
    getWorld: function() {
      return this._world;
    },
    
    serverInfo: function() {
        return {
            revision: Defs.GIT_REVISION
        };
    }
};
