var io          = require("socket.io"),
    _           = require("underscore"),
    Defs        = require("defs"),
    Client      = require("client"),
    World       = require("world"),
    Account     = require("account"),
    PortalTile  = require("portal_tile"),
    Routes      = require("routes");

var GameServer = module.exports = function(app) {
    this._app          = app;
    this._world        = new World();
    this._unsavedEdits = {};
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
            zone    = world.getZone(account.getEditorZoneId());

        console.log("INIT EDITOR SESSION FOR USER " + account.getUsername());

        account.setEditorViewTileIndex(zone.getDefaultSpawnPointIndex());
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
            var middleTileIdx = Math.floor((newZone.getDimensions()[0]*newZone.getDimensions()[1])/2);
            account.setEditorViewTileIndex(middleTileIdx);
            account.save(function(){
              client.sendZoneData(newZone);
              client.sendZoneState(world.composeZoneStateFor(account, newZone.getStateAttributes()));
            });
          }
        });
        
        client.on("editTile", function(msg) {
          var zoneId = account.getEditorZoneId();
          var zone = world.getZone(zoneId);
          if ((zone !== undefined) && (zone.getAccountId() == account.getId())) {
              var editLayer = Defs[msg.layer];
              zone.getBoard().getLayer(editLayer).clearTile(msg.tile_idx);
              zone.getBoard().getLayer(editLayer).pushTile(msg.tile_idx, [ Number(msg.new_tile) ]);
              self.addUnsavedEdit(account.getId(), zoneId);
              client.sendZoneState(world.composeZoneStateFor(account, zone.getStateAttributes()));
          }
        });
    },
    
    addUnsavedEdit: function(accountId, zoneId) {
      if (this._unsavedEdits[accountId] === undefined) { this._unsavedEdits[accountId] = [];}
      if (this._unsavedEdits[accountId].indexOf(zoneId) == -1) {
        this._unsavedEdits[accountId].push(zoneId);
      }
    },
    
    getUnsavedEdits: function(accountId) {
      return this._unsavedEdits[accountId];
    },
    
    clearUnsavedEdits: function(accountId) {
      this._unsavedEdits[accountId] = [];
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
