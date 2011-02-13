var io          = require("socket.io"),
    _           = require("underscore"),
    Defs        = require("defs"),
    Client      = require("client"),
    World       = require("world"),
    Account     = require("account"),
    PortalTile  = require("portal_tile"),
    Routes      = require("routes");

var GameServer = module.exports = function(app) {
    this._app   = app;
    this._world = new World();
    this._world.on("loaded", _(this._onWorldLoaded).bind(this));
};

GameServer.prototype = {
    _onWorldLoaded: function() {
        console.log("world loaded?");
        this._socket = io.listen(this._app);
        this._socket.on("connection", _(this._onConnect).bind(this));
    },
    
    _onConnect: function(conn) {
        var server  = this,
            client  = new Client(conn);
            
        client.on("receivedHandshakeRequest", function(sessionId) {
            server.initAccount(client, sessionId);
        });
        conn.on("message", function(msg) { client.onMessage(msg); });
        conn.on("disconnect", function() { client.onDisconnect(); });
    },
    
    initAccount: function(client, sessionId) {
        var server = this;

        Account.initFromSession(sessionId, function(account){
            console.log("INIT SESSION FOR USER " + account.getUsername());
            // var alreadyLoggedInAccount = world.getAccountById(account.getId());
            // console.log(alreadyLoggedInAccount);
            // if (alreadyLoggedInAccount) {
            //     alreadyLoggedInAccount.kick();
            // }
            client.sendMessage("ServerInfo", server.getInfo());
            account.setClient(client);
            server.loadGame(account);
        });
    },
    
    loadGame: function(account){
        this._world.connectPlayer(account, this, this.bindActorEvents);
    },
    
    bindActorEvents: function(account){
        var world   = this._world,
            client  = account.getClient(),
            actor   = account.getPlayer(),
            zone    = world.getZone(actor.getZoneId());

        world.broadcastMessage(Defs.CHAT_SYSTEM, account.getUsername() + " connected.");
        
        client.completeHandshake();
        client.sendZoneData(zone);
        client.sendZoneState(world.composeZoneStateFor(actor, zone.getStateAttributes()));
        client.sendScoreUpdate(account.getScore());

        account.on("changeScore", function(score) {
            client.sendScoreUpdate(score);
        });

        actor.on("changeZone", function() {
            var zoneId = actor.getZoneId();
            if (zoneId) {
                var zone = world.getZone(zoneId);
                client.sendZoneData(zone);
                client.sendZoneState(world.composeZoneStateFor(actor, zone.getStateAttributes()));
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

            if (zoneId) {
                var zone = world.getZone(zoneId);

                if (command == "n" || command == "s" || command == "e" || command == "w") {
                    zone.command(actor, command);
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

    // Removed the cookie-based fetching of the session key because the Handshake is really
    // the best way to get the session ID cookie. It works for everything, period.
    
    getInfo: function() {
        return {
            revision: Defs.GIT_REVISION
        };
    },
    
    onSuccessfulHandshake: function(client) {
        client.sendMessage("ServerInfo", this.getInfo());
    }
};
