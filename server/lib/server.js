var io      = require("socket.io"),
    Client  = require("client"),
    World   = require("world"),
    Account = require("account");
        
var Server = module.exports = function(app) {
    var socket      = io.listen(app),
        world       = new World();

    world.setDefaultZone(world.generateDefaultZone());
    
    socket.on("connection", function(conn) {
        var account = new Account(),
            client  = new Client(conn, account);

        world.addAccount(account);

        conn.on("message", function(msg) {
            console.log(msg);
            client.onMessage(msg);
        });

        conn.on("disconnect", function() {
            client.onDisconnect();
        });
    });
};