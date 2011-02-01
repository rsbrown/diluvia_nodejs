require.paths.unshift("./lib");
require.paths.unshift("./ext");

var express     = require("express"),
    io          = require("socket.io"),
    Env         = require("env"),
    Client      = require("client"),
    World       = require("world"),
    Account     = require("account"),
    connect     = require("connect"),        
    GameServer  = require("game_server"),
    Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile"),
    Routes      = require("routes"),
    Persistence = require("persistence"),
    RedisStore  = require("connect-redis"),
    Web         = require("web");

var app = express.createServer();

app.use(express.staticProvider(__dirname + "/public"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.bodyDecoder());
app.use(express.cookieDecoder());
app.use(express.session({
    key:        "DiluviaSession",
    secret:     "zZICGH40MKxHDTTqOCLbA4YN3CcvKoMOOZIkEkOc6C2LHuNMWHAEYzoeBjnqSzy3dpoDhZZhthe7y4ZpMpGpcQcdLVKHGhAlhAvkMxzlFC7eDleIEkXj3XMVWVVAd3Hbpp3epw9iBuBqvOZY4lZ7bdAgtN5VEVvRT5VM5UXzq7y1NX5uXkULPieYsuLFjyAlJRjczCCL",
    store:      new RedisStore() 
}));

app.listen(3000);

var gameServer  = new GameServer(app),
    web         = new Web(app);
