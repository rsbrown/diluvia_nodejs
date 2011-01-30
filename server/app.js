require.paths.unshift("./lib");

var express = require("express"),
    io      = require("socket.io"),
    redis   = require("redis-client"),
    Env     = require("env"),
    Client  = require("client"),
    World   = require("world"),
    Account = require("account");

var app = express.createServer();

app.use(express.staticProvider(__dirname + "/public"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.bodyDecoder());
app.use(express.cookieDecoder());
app.use(express.session({key: '69c39bb0-2c14-11e0-91fa-0800200c9a66',
                         secret: 'mooninites7b67c080'}));

app.listen(3000);

var socket  = io.listen(app),
    world   = new World();

app.get('/', function(req, res){
  res.render('index');
});

app.get('/play', function(req, res){
  res.render('world');
});

app.get('/edit', function(req, res){
  res.render('editor');
});

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
