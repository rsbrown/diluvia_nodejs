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
        this._socket.enable('browser client etag');
        this._socket.set('log level', IO_LOG_LEVEL);
        this._socket.set('transports', [
            'websocket'
          , 'flashsocket'
          , 'htmlfile'
          , 'xhr-polling'
          , 'jsonp-polling'
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
        
        client.initZoneData(zone);
        client.sendScoreUpdate(account.getScore());

        account.on("changeScore", function(score) {
            client.sendScoreUpdate(score);
        });

        actor.on("changeZone", function() {
            var zoneId = actor.getZoneId();
            if (zoneId) {
                var zone = world.getZone(zoneId);
                client.initZoneData(zone);
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
            world   = this._world;

        console.log("INIT EDITOR SESSION FOR USER " + account.getUsername());
        var startZone = world.getZone(account.getEditorZoneId()) || world.getZone(account.getIslandZoneId())
        account.setEditorViewTileIndex(startZone.getCenterTileIndex());
        client.initZoneData(startZone);
        
        client.on("centerEditorView", function(index) {
            var zoneId  = account.getEditorZoneId();
            if (zoneId !== undefined) {
                var zone = world.getZone(zoneId);
                zone.centerEditor(account, index);
            }
        });
        
        client.on("switchZone", function(zoneId){
          self.switchEditZone(account, zoneId, true);
        });
        
        client.on("saveZone", function(zoneId, zoneData) {
          Zone.findById(zoneId, function(updateZone){
            if (updateZone && (updateZone.getAccountId() == account.getId())) {
              updateZone.resetConfig(zoneData, world.getZone(zoneId));
              updateZone.save(function(){
                world.setZone(zoneId, updateZone);
                self.switchEditZone(account, zoneId, false);
              });
            }
          });
        });
    },
    
    switchEditZone: function(account, zoneId, recenterView) {
      var newZone = this._world.getZone(zoneId);
      if ((newZone !== undefined) && (newZone.getAccountId() == account.getId())) {
        account.setEditorZoneId(zoneId);
        if (recenterView) {
          account.setEditorViewTileIndex(newZone.getCenterTileIndex());
        }
        account.save(function(){
          account.getClient().initZoneData(newZone);
        });
      }
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
