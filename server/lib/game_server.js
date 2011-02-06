var io          = require("socket.io"),
    _           = require("underscore"),
    Defs        = require("defs"),
    Client      = require("client"),
    World       = require("world"),
    Account     = require("account"),
    PortalTile  = require("portal_tile"),
    Routes      = require("routes");

var GameServer = module.exports = function(app) {
    this._world   = new World();
    this._socket  = io.listen(app);

    // I moved the route stuff back into Web because I think the "Server" itself
    // should be mostly concerned about game world state & events. I renamed it to
    // signify that assertion --RB

    // actually, the socket connection event is received for each connection,
    // so we'd need a way to have the function callback for the connection to
    // determine where that connection was coming from. If we pass in the
    // account here, it will be static for every connection. --RB
    
    this._socket.on("connection", _(this._onConnect).bind(this));
};


GameServer.prototype = {
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
            client.sendMessage("ServerInfo", server.getInfo());
            server.loadGame(client, account);
        });
    },
    
    loadGame: function(client, account){
        var world   = this._world,
            actor   = world.playerInitialize(account, client),
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
