require.paths.unshift("./lib");

var express = require("express"),
    io      = require("socket.io"),
    Client  = require("client"),
    World   = require("world"),
    Account = require("account");

var app = express.createServer();

app.use(express.staticProvider(__dirname + "/public"));

app.listen(3000);

var socket  = io.listen(app),
    world   = new World();

socket.on("connection", function(conn) {
    var account = new Account(),
        client  = new Client(conn, account);
    
    world.addAccount(account);
    
    conn.on("message", function(msg) {
        client.onMessage(msg);
    });
    
    conn.on("disconnect", function() {
        client.onDisconnect();
    });
});
