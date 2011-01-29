var express = require("express"),
    io      = require("socket.io");

var app = express.createServer();

app.use(express.staticProvider(__dirname + "/public"));

app.listen(3000);

var socket = io.listen(app);

socket.on("connection", function() {
    
});
