var io          = require("socket.io"),
    _           = require("underscore"),
    Defs        = require("defs"),
    Client      = require("client"),
    World       = require("world"),
    Account     = require("account"),
    PortalTile  = require("portal_tile"),
    Routes      = require("routes");

var GameServer = module.exports = function(app) {
    this._socket  = io.listen(app);
    this._world   = new World();

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
        var client  = new Client(this, conn);

        conn.on("message", function(msg) {
            console.log(msg);
            client.onMessage(msg);
        });

        conn.on("disconnect", function() {
            client.onDisconnect();
        });   
    },
    
    getInfo: function() {
        return {
            revision: Defs.GIT_REVISION
        };
    },
    
    getAccountForSession: function(sessionId) {
        // TODO: replace with code that gets an account by session ID 
        var account = new Account(this._world);
        return account;
    },
    
    onSuccessfulHandshake: function(client) {
        client.sendMessage("ServerInfo", this.getInfo());
    }
};
